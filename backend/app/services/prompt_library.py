"""
Prompt library for Task 4: Prompt Engineering Playground.
Each task category defines an instruction and example input/output pairs
used to build zero-shot, one-shot, few-shot, and chain-of-thought prompts.
"""

TASK_CATEGORIES = {
    "sentiment": {
        "label": "Sentiment Classification",
        "domain": "general",
        "instruction": "Classify the sentiment of the following text as Positive, Negative, or Neutral. Reply with only the label.",
        "examples": [
            {"input": "This product completely exceeded my expectations!", "output": "Positive"},
            {"input": "The service was slow and the staff was rude.", "output": "Negative"},
            {"input": "The package arrived on Tuesday as scheduled.", "output": "Neutral"},
            {"input": "I regret buying this, total waste of money.", "output": "Negative"},
        ],
    },
    "summarize": {
        "label": "Text Summarization",
        "domain": "general",
        "instruction": "Summarize the following text in one short sentence.",
        "examples": [
            {
                "input": "The city council approved a new budget yesterday that increases funding for public parks by 15% while reducing spending on road maintenance. Residents expressed mixed reactions during the public comment period.",
                "output": "The city council raised park funding by 15% and cut road maintenance spending, drawing mixed public reaction.",
            },
            {
                "input": "Scientists discovered a new species of frog in the Amazon rainforest last month. The frog has unique bright blue markings and can survive in both water and trees, which is unusual for its family.",
                "output": "Scientists found a new Amazon frog species with unique blue markings that can live in both water and trees.",
            },
        ],
    },
    "math": {
        "label": "Math Word Problem",
        "domain": "general",
        "instruction": "Solve the following math word problem. Give only the final numeric answer.",
        "examples": [
            {
                "input": "A store had 84 apples. They sold 27 in the morning and 18 in the afternoon. How many apples are left?",
                "output": "39",
            },
            {
                "input": "A train travels 60 km in 45 minutes. What is its speed in km per hour?",
                "output": "80",
            },
        ],
    },
    "labor_classify": {
        "label": "Labor Law Question Classification",
        "domain": "labor_law",
        "instruction": "Classify the following labor law question into exactly one category: Wages, Leave, Termination, Work Hours, Safety, or Other. Reply with only the category name.",
        "examples": [
            {"input": "How many vacation days am I entitled to per year?", "output": "Leave"},
            {"input": "Can my employer fire me without notice?", "output": "Termination"},
            {"input": "What is the maximum number of working hours per week?", "output": "Work Hours"},
            {"input": "Is my employer required to provide safety equipment?", "output": "Safety"},
        ],
    },
    "labor_answer": {
        "label": "Labor Law Q&A",
        "domain": "labor_law",
        "instruction": "Answer the following labor law question briefly and accurately, based on general labor law principles.",
        "examples": [
            {
                "input": "Is an employer allowed to deduct fines from an employee's wage without limit?",
                "output": "No, deductions are strictly limited, typically to a small percentage of the base wage, and only for specific documented reasons.",
            },
        ],
    },
}


def get_category(key: str) -> dict:
    if key not in TASK_CATEGORIES:
        raise ValueError(f"Unknown task category: {key}")
    return TASK_CATEGORIES[key]


def list_categories() -> list[dict]:
    return [
        {"key": key, "label": val["label"], "domain": val["domain"]}
        for key, val in TASK_CATEGORIES.items()
    ]