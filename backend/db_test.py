import asyncio
from sqlalchemy import text
from app.db.database import engine

async def test():
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            print("DATABASE CONNECTED:", result.scalar())
    except Exception as e:
        print("DATABASE ERROR:")
        print(type(e).__name__)
        print(str(e))

asyncio.run(test())