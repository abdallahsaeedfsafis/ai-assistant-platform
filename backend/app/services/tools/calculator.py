import math

ALLOWED_NAMES = {
    "abs": abs, "round": round, "min": min, "max": max,
    "sum": sum, "pow": pow,
    "sqrt": math.sqrt, "pi": math.pi, "e": math.e,
    "sin": math.sin, "cos": math.cos, "tan": math.tan,
    "log": math.log, "log10": math.log10,
    "floor": math.floor, "ceil": math.ceil,
}


def calculate(expression: str) -> str:
    """Safely evaluates a math expression and returns the result as a string."""
    try:
        allowed_chars = set("0123456789+-*/(). ,")
        if not all(c in allowed_chars or c.isalpha() for c in expression):
            return "Error: expression contains invalid characters."

        result = eval(expression, {"__builtins__": {}}, ALLOWED_NAMES)
        return str(result)
    except Exception as e:
        return f"Error: could not evaluate expression ({str(e)})"