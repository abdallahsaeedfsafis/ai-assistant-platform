from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings


def _normalize_db_url(url: str) -> str:
    """Neon gives a 'postgresql://...?sslmode=require' URL. The async
    'asyncpg' driver needs the '+asyncpg' prefix and doesn't understand
    the 'sslmode' query parameter the same way — so we strip it and pass
    SSL as a separate connect argument instead (see connect_args below)."""
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if "?" in url:
        url = url.split("?")[0]
    return url


engine = create_async_engine(
    _normalize_db_url(settings.DATABASE_URL),
    echo=False,
    connect_args={"ssl": "require"},
    pool_pre_ping=True,   # tests each connection before using it, discards stale ones
    pool_recycle=300,     # proactively recycle connections older than 5 minutes
)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

Base = declarative_base()


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)