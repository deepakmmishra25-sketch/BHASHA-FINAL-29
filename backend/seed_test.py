import asyncio
from app.db.init_db import seed_categories, seed_lessons, seed_schemes

async def main():
    await seed_categories()
    await seed_lessons()
    await seed_schemes()
    print("SEED DATA COMPLETE")

asyncio.run(main())