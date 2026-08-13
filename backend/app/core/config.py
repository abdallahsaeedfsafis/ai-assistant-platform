import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # LLM_PROVIDER
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "groq").lower()

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GROK_API_KEY: str = os.getenv("GROK_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "")
    JINA_API_KEY: str = os.getenv("JINA_API_KEY", "")
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  

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