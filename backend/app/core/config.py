import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # LLM_PROVIDER يحدد أي مزود نستخدم: "gemini" أو "grok" أو "groq"
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "groq").lower()

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GROK_API_KEY: str = os.getenv("GROK_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")

    APP_NAME: str = "AI Assistant Platform"

    def validate(self):
        provider_keys = {
            "gemini": self.GEMINI_API_KEY,
            "grok": self.GROK_API_KEY,
            "groq": self.GROQ_API_KEY,
        }
        if self.LLM_PROVIDER not in provider_keys:
            raise RuntimeError(
                f"LLM_PROVIDER='{self.LLM_PROVIDER}' مش مدعوم. "
                f"استخدم: {', '.join(provider_keys.keys())}"
            )
        if not provider_keys[self.LLM_PROVIDER]:
            raise RuntimeError(
                f"مفتاح {self.LLM_PROVIDER.upper()}_API_KEY مش موجود بملف .env"
            )


settings = Settings()