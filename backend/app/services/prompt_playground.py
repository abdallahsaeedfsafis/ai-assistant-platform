"""
Builds zero-shot, one-shot, few-shot, and chain-of-thought prompts
for a given task category and user input, runs them all against the
model, and returns the results for side-by-side comparison.
"""
import time
from openai import OpenAI
from app.core.config import settings
from app.services.prompt_library import get_category

MODEL_NAME = "openai/gpt-oss-20b"


def _get_client() -> OpenAI:
    return OpenAI(api_key=settings.GROQ_API_KEY, base_url="https://api.groq.com/openai/v1")


def _build_zero_shot(instruction: str, user_input: str) -> str:
    return f"{instruction}\n\nInput: {user_input}\nOutput:"


def _build_one_shot(instruction: str, examples: list[dict], user_input: str) -> str:
    example = examples[0]
    return (
        f"{instruction}\n\n"
        f"Example:\n"
        f"Input: {example['input']}\n"
        f"Output: {example['output']}\n\n"
        f"Now do the same for this:\n"
        f"Input: {user_input}\n"
        f"Output:"
    )


def _build_few_shot(instruction: str, examples: list[dict], user_input: str) -> str:
    examples_text = "\n\n".join(
        f"Input: {ex['input']}\nOutput: {ex['output']}" for ex in examples
    )
    return (
        f"{instruction}\n\n"
        f"Examples:\n{examples_text}\n\n"
        f"Now do the same for this:\n"
        f"Input: {user_input}\n"
        f"Output:"
    )


def _build_chain_of_thought(instruction: str, user_input: str) -> str:
    return (
        f"{instruction}\n\n"
        f"Input: {user_input}\n\n"
        f"Think through this step by step, showing your reasoning, "
        f"then give your final answer on a new line starting with 'Final Answer:'."
    )


def _run_prompt(client: OpenAI, prompt: str) -> dict:
    start = time.time()
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    elapsed_ms = round((time.time() - start) * 1000)
    return {
        "output": response.choices[0].message.content,
        "elapsed_ms": elapsed_ms,
    }


async def compare_strategies(category_key: str, user_input: str) -> dict:
    category = get_category(category_key)
    instruction = category["instruction"]
    examples = category["examples"]
    client = _get_client()

    prompts = {
        "zero_shot": _build_zero_shot(instruction, user_input),
        "one_shot": _build_one_shot(instruction, examples, user_input),
        "few_shot": _build_few_shot(instruction, examples, user_input),
        "chain_of_thought": _build_chain_of_thought(instruction, user_input),
    }

    results = {}
    for strategy_key, prompt_text in prompts.items():
        try:
            run_result = _run_prompt(client, prompt_text)
            results[strategy_key] = {
                "prompt": prompt_text,
                "output": run_result["output"],
                "elapsed_ms": run_result["elapsed_ms"],
                "error": None,
            }
        except Exception as e:
            results[strategy_key] = {
                "prompt": prompt_text,
                "output": None,
                "elapsed_ms": None,
                "error": str(e),
            }

    return {
        "category": category_key,
        "category_label": category["label"],
        "input": user_input,
        "results": results,
    }