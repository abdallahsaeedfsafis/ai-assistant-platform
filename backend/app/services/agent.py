import json
from openai import OpenAI
from app.core.config import settings
from app.services.tools.calculator import calculate
from app.services.tools.weather import get_weather
from app.services.tools.search import search_web
from app.services.vector_store import search_relevant_chunks

MODEL_NAME = "openai/gpt-oss-20b"

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "calculate",
            "description": "Evaluates a mathematical expression and returns the numeric result. Use for any arithmetic or numeric calculation.",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {"type": "string", "description": "The math expression, e.g. '25 * 48' or 'sqrt(144)'."}
                },
                "required": ["expression"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Gets the current weather for a given city name.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "The city name, e.g. 'Nablus' or 'Tokyo'."}
                },
                "required": ["city"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "Searches the internet for current or recent information not in the model's own knowledge, such as news or recent events.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "The search query."}
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_documents",
            "description": "Searches the user's uploaded documents. Use this whenever the question could relate to 'this project', 'this document', or any content the user may have uploaded.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "The question or topic to search for."}
                },
                "required": ["query"],
            },
        },
    },
]


def _search_documents_tool(query: str) -> str:
    chunks = search_relevant_chunks(query)
    if not chunks:
        return "No relevant information found in the uploaded documents."
    return "\n\n---\n\n".join(chunks)


TOOL_FUNCTIONS = {
    "calculate": lambda args: calculate(args["expression"]),
    "get_weather": lambda args: get_weather(args["city"]),
    "search_web": lambda args: search_web(args["query"]),
    "search_documents": lambda args: _search_documents_tool(args["query"]),
}

SYSTEM_PROMPT = """You are a helpful AI assistant with access to tools: a calculator, a weather lookup, \
a web search, and a search over the user's uploaded documents.

Use a tool only when it is genuinely needed to answer accurately. For general knowledge questions, \
answer directly without using any tool.

If a question asks about "this project", "this document", or similar, and after using search_documents \
you still don't have that specific information, say clearly that you don't have that information instead \
of guessing or making something up."""


def _get_client() -> OpenAI:
    return OpenAI(api_key=settings.GROQ_API_KEY, base_url="https://api.groq.com/openai/v1")


async def generate_agent_response(message: str, history: list[dict]) -> dict:
    client = _get_client()

    # Always check uploaded documents first, regardless of how the question is phrased.
    # This doesn't rely on the model deciding to call search_documents.
    auto_context = search_relevant_chunks(message)

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if auto_context:
        context_text = "\n\n---\n\n".join(auto_context)
        messages.append({
            "role": "system",
            "content": f"The following content was found in the user's uploaded documents and may be relevant to their next question:\n\n{context_text}\n\nIf it answers the question, use it. If it's not actually relevant, ignore it and answer normally.",
        })

    messages += [{"role": h["role"], "content": h["content"]} for h in history]
    messages.append({"role": "user", "content": message})

    tools_used = ["search_documents"] if auto_context else []

    first_response = None
    max_retries = 2

    for attempt in range(max_retries):
        try:
            first_response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=messages,
                tools=TOOLS,
                tool_choice="auto",
                temperature=0.4,
            )
            break
        except Exception as e:
            if "tool_use_failed" in str(e) and attempt < max_retries - 1:
                continue
            if "tool_use_failed" in str(e):
                fallback = client.chat.completions.create(
                    model=MODEL_NAME,
                    messages=messages,
                    temperature=0.4,
                )
                return {"answer": fallback.choices[0].message.content, "tools_used": tools_used}
            raise

    response_message = first_response.choices[0].message
    tool_calls = response_message.tool_calls

    if not tool_calls:
        return {"answer": response_message.content, "tools_used": tools_used}

    messages.append({
        "role": "assistant",
        "content": response_message.content,
        "tool_calls": [
            {
                "id": tc.id,
                "type": "function",
                "function": {"name": tc.function.name, "arguments": tc.function.arguments},
            }
            for tc in tool_calls
        ],
    })

    for tool_call in tool_calls:
        function_name = tool_call.function.name
        function_args = json.loads(tool_call.function.arguments)
        function_to_call = TOOL_FUNCTIONS.get(function_name)
        if function_name not in tools_used:
            tools_used.append(function_name)

        if function_to_call is None:
            result = f"Unknown tool: {function_name}"
        else:
            try:
                result = function_to_call(function_args)
            except Exception as e:
                result = f"Tool error: {str(e)}"

        messages.append({
            "role": "tool",
            "tool_call_id": tool_call.id,
            "name": function_name,
            "content": str(result),
        })

    second_response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        temperature=0.4,
    )

    return {"answer": second_response.choices[0].message.content, "tools_used": tools_used}