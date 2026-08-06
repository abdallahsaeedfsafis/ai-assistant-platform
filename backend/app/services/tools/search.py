import requests
from app.core.config import settings

TAVILY_URL = "https://api.tavily.com/search"


def search_web(query: str) -> str:
    """Searches the web for current information and returns summarized results."""
    if not settings.TAVILY_API_KEY:
        return "Web search is not configured on the server."

    response = requests.post(
        TAVILY_URL,
        json={
            "api_key": settings.TAVILY_API_KEY,
            "query": query,
            "search_depth": "basic",
            "max_results": 3,
        },
        timeout=15,
    )
    response.raise_for_status()
    results = response.json().get("results", [])

    if not results:
        return "No search results found."

    formatted = [f"- {r.get('title')}: {r.get('content')} (source: {r.get('url')})" for r in results]
    return "\n".join(formatted)