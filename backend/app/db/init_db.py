async def seed_lessons() -> None:
    """Seed knowledge-base lessons if none exist."""
    from sqlalchemy import select
    from app.db.database import AsyncSessionLocal
    from app.models.lesson import Category, Lesson

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Lesson).limit(1))
        if result.scalar_one_or_none():
            return

        cats = {c.slug: c.id for c in (await session.execute(select(Category))).scalars().all()}
        if not cats:
            return

        lessons = [
            Lesson(
                category_id=cats.get("business", 1),
                title="How to Start a Small Business",
                title_hindi="छोटा व्यापार कैसे शुरू करें",
                description="Step-by-step guide to starting your own business in India.",
                youtube_url="https://youtu.be/iKmdcd4IVWU",
                content="""Starting a small business in India requires careful planning. Here are the key steps:

1. **Identify your idea**: What product or service will you sell? Choose something you understand.
2. **Research your market**: Who are your customers? What do they need? What are competitors doing?
3. **Create a simple business plan**: Write down your goals, expected costs, and how you'll make money.
4. **Register your business**: You can register as a Sole Proprietorship (simplest), Partnership, or Private Limited Company.
5. **Get required licenses**: GST registration (if turnover > ₹20 lakh), shop license from municipality, FSSAI for food businesses.
6. **Open a current bank account**: Separate business and personal finances.
7. **Start small and grow**: Begin with minimal investment and expand as you earn.

Remember: The PM Mudra Yojana offers loans up to ₹10 lakh for small businesses without collateral.""",
                level="beginner",
                duration_minutes=15,
                is_published=True,
            ),
            Lesson(
                category_id=cats.get("business", 1),
                title="Writing a Business Plan",
                title_hindi="व्यापार योजना कैसे लिखें",
                description="Learn to write a simple, effective business plan.",
                youtube_url="https://youtu.be/t3KMKl_l4JE",
                content="""A business plan is your roadmap. Even a simple 1-page plan helps you stay focused.

**Key sections:**

1. **Business Idea**: What you sell and why customers will buy it.
2. **Target Customers**: Who needs your product? Age, location, income level.
3. **Revenue Model**: How will you make money? Price per unit × expected sales.
4. **Startup Costs**: Equipment, raw materials, rent, licenses.
5. **Monthly Expenses**: Salaries, utilities, supplies.
6. **Break-even Point**: How many units/services do you need to sell to cover costs?

**Simple example for a tea stall:**
- Tea costs ₹3/cup to make, sells for ₹10
- Profit per cup: ₹7
- Monthly rent + gas + wages: ₹8,000
- Need to sell: 8000 ÷ 7 = ~1,143 cups/month = ~38 cups/day

Keep your plan simple, honest, and realistic.""",
                level="beginner",
                duration_minutes=20,
                is_published=True,
            ),
            Lesson(
                category_id=cats.get("business", 1),
                title="GST Basics for Small Businesses",
                title_hindi="छोटे व्यापार के लिए GST की मूल बातें",
                description="Understand GST registration, filing, and compliance.",
                youtube_url="https://youtu.be/zfgXNZxoq58",
                content="""GST (Goods and Services Tax) replaced multiple taxes in India in 2017.

**Do you need to register for GST?**
- Yes, if your annual turnover exceeds ₹20 lakh (₹10 lakh for special states)
- Yes, if you sell goods inter-state (even if turnover is less)
- Optional if below threshold (Voluntary registration has benefits)

**GST rates:** 0%, 5%, 12%, 18%, 28%
- Basic food items: 0%
- Packaged food, hotels: 5%
- Clothes, processed food: 12%
- Most services, electronics: 18%
- Luxury goods: 28%

**Filing returns:**
- GSTR-1: Monthly/quarterly sales details
- GSTR-3B: Monthly summary return + tax payment

**Benefits of GST registration:**
- Input tax credit (claim back GST paid on purchases)
- Appear legitimate to larger buyers
- Required for e-commerce selling

**Penalty for non-registration:** 10% of tax due (minimum ₹10,000)""",
                level="intermediate",
                duration_minutes=25,
                is_published=True,
            ),
            Lesson(
                category_id=cats.get("finance", 2),
                title="Opening a Business Bank Account",
                title_hindi="व्यापार बैंक खाता कैसे खोलें",
                description="Everything you need to know about business banking.",
                youtube_url="https://youtu.be/ZxYAbOrfhEs",
                content="""A separate business bank account is essential for every entrepreneur.

**Why you need it:**
- Separates personal and business money
- Makes tax filing easier
- Looks professional to customers and suppliers
- Required for business loans

**Types of accounts:**
- **Current Account**: For businesses — unlimited transactions, no interest, overdraft facility
- **Savings Account**: For individuals — limited transactions, earns interest

**Documents needed for Current Account:**
- Business registration certificate / trade license
- PAN card (business + proprietor)
- Aadhaar card
- Address proof
- 2 passport-size photos

**Best banks for small businesses:** SBI, Bank of Baroda, Canara Bank (government banks), HDFC, ICICI, Axis (private banks)

**Zero-balance current accounts** are available at some banks under PM Jan Dhan for small businesses.

**Tip:** Compare minimum balance requirements. Government banks usually have lower minimums.""",
                level="beginner",
                duration_minutes=12,
                is_published=True,
            ),
            Lesson(
                category_id=cats.get("finance", 2),
                title="Understanding Business Loans",
                title_hindi="व्यापार ऋण को समझें",
                description="Types of loans available for small businesses and how to apply.",
                youtube_url="https://youtu.be/zlpmApnESWE",
                content="""Getting a loan can help your business grow. Here's what you need to know:

**Types of business loans:**

1. **Mudra Loan** (most popular for small businesses)
   - Shishu: up to ₹50,000
   - Kishor: ₹50,000 to ₹5 lakh
   - Tarun: ₹5 lakh to ₹10 lakh
   - No collateral needed, apply at any bank

2. **MSME Loans**
   - Up to ₹2 crore
   - 45-day processing under MSME Act
   - CGTMSE guarantee (no collateral for loans up to ₹2Cr)

3. **Kisan Credit Card** (for farmers)
   - Revolving credit for agricultural needs
   - Interest rate ~7% p.a.

**How to improve your loan chances:**
- Maintain good credit score (CIBIL score 700+)
- Keep 6 months bank statements clean
- Have a written business plan
- Show GST returns if registered

**Interest rate comparison:**
- Government banks: 10-14% p.a.
- Private banks: 12-18% p.a.
- MFIs (microfinance): 18-24% p.a.
- Moneylenders: AVOID (40-60% p.a.)""",
                level="intermediate",
                duration_minutes=20,
                is_published=True,
            ),
            Lesson(
                category_id=cats.get("farming", 3),
                title="Modern Farming Techniques",
                title_hindi="आधुनिक खेती की तकनीकें",
                description="Improve your crop yield with modern agricultural methods.",
                youtube_url="https://youtu.be/OqREBOP7A0I",
                content="""Modern farming can significantly increase your income. Here are proven techniques:

**1. Drip Irrigation**
- Saves 30-50% water compared to flood irrigation
- Delivers water directly to roots
- Reduces weed growth
- Suitable for vegetables, fruits, sugarcane
- Cost: ₹40,000-₹60,000 per acre (subsidy available under PMKSY)

**2. Soil Health Card**
- Government gives free soil testing
- Know exactly which nutrients your soil needs
- Avoid over-fertilization (saves money)
- Apply at nearest Krishi Vigyan Kendra (KVK)

**3. Integrated Pest Management (IPM)**
- Use natural predators, bio-pesticides
- Reduces chemical costs by 30-40%
- Safer for health and environment
- Better prices for organic produce

**4. Crop Rotation**
- Alternate between crops each season
- Improves soil nutrients naturally
- Reduces pest buildup
- Example: Rice → Wheat → Legumes

**5. SRI Method (System of Rice Intensification)**
- Plants fewer seedlings but spaced wider
- Can increase rice yield by 20-50%
- Saves seeds (costs less)
- Requires less water

**Key contacts:**
- Nearest KVK (Krishi Vigyan Kendra): 0800-180-1551
- PM Kisan helpline: 155261""",
                level="intermediate",
                duration_minutes=25,
                is_published=True,
            ),
            Lesson(
                category_id=cats.get("farming", 3),
                title="Selling Your Crops at Better Prices",
                title_hindi="अपनी फसल को बेहतर कीमत पर बेचें",
                description="Avoid middlemen and get fair prices for your produce.",
                youtube_url="https://youtu.be/pqMWTwLrOLU",
                content="""Many farmers lose 20-40% of potential income to middlemen. Here's how to do better:

**1. eNAM (National Agriculture Market)**
- Online trading platform connecting farmers to buyers
- Register at enam.gov.in or nearest APMC
- Transparent price discovery
- Payment directly to bank account

**2. FPOs (Farmer Producer Organizations)**
- Group 50-100 farmers together
- Collective bargaining → better prices
- Shared storage, transport, and processing costs
- Government provides ₹15 lakh equity grant to new FPOs

**3. Minimum Support Price (MSP)**
- Government guaranteed price for 23 crops
- Wheat: ₹2,275/quintal (2024-25)
- Paddy: ₹2,300/quintal
- Sell through NAFED or Food Corporation of India

**4. Direct selling options:**
- Local haats and markets
- WhatsApp groups of consumers
- Organic stores and restaurants in cities
- Export (for high-quality produce)

**5. Value addition:**
- Dry and package spices instead of selling raw
- Make pickles, jams, juices from surplus produce
- Can increase income by 2-5x

**PM AASHA scheme** ensures farmers get MSP for oilseeds and pulses.""",
                level="intermediate",
                duration_minutes=20,
                is_published=True,
            ),
            Lesson(
                category_id=cats.get("digital", 4),
                title="UPI and Digital Payments",
                title_hindi="UPI और डिजिटल भुगतान",
                description="Accept digital payments for your business using UPI.",
                youtube_url="https://youtu.be/RE20yU-6Y7s",
                content="""Digital payments can help your business accept money from anywhere, anytime.

**UPI (Unified Payments Interface)**
- Free to use, instant transfers 24/7
- Works between all bank accounts
- Apps: PhonePe, Google Pay, Paytm, BHIM

**For your business:**

1. **UPI QR Code** (simplest)
   - Download PhonePe/Google Pay Business
   - Get your QR code printed (even on paper)
   - Customers scan and pay instantly
   - Money directly to your bank account
   - Cost: FREE

2. **Paytm for Business**
   - Free QR code + Paytm sound box (₹99/month)
   - Audio alerts when payment received
   - Track all transactions in app
   - Accept cards too

3. **Razorpay/Instamojo** (for online selling)
   - Get a payment link to share on WhatsApp
   - Customer pays without any app
   - 2% transaction fee
   - Auto-reconciliation

**Advantages of going digital:**
- No change money problems
- Automatic transaction record for accounting
- Bank loan eligibility improves
- Customers prefer cashless (especially younger buyers)

**Security tips:**
- Never share OTP with anyone
- Check merchant name before paying
- Enable SMS alerts on your bank account""",
                level="beginner",
                duration_minutes=15,
                is_published=True,
            ),
            Lesson(
                category_id=cats.get("digital", 4),
                title="Using WhatsApp for Business",
                title_hindi="व्यापार के लिए WhatsApp का उपयोग",
                description="Grow your business using WhatsApp Business app.",
                youtube_url="https://youtu.be/k7bX9WbJwq0",
                content="""WhatsApp Business is free and used by 5 crore+ Indian small businesses.

**Setting up WhatsApp Business:**
1. Download WhatsApp Business (separate from personal WhatsApp)
2. Create your business profile with name, address, description, hours
3. Add your product catalogue (up to 500 products, free)
4. Set up automated messages (greeting, away message, quick replies)

**Features that help your business:**

**Product Catalogue:**
- Add photos, descriptions, and prices
- Share catalogue link on social media
- Customers browse and order easily

**Labels:**
- Organise chats: New Customer, Order Pending, Payment Due, Completed
- Never miss a follow-up

**Broadcast Lists:**
- Send one message to 256 customers at once
- Announce new products, offers, festivals
- (Customers must have your number saved)

**Quick Replies:**
- Save common responses (price list, directions, return policy)
- Reply instantly with shortcuts

**Status Updates:**
- Post daily offers as WhatsApp Status
- Seen by all contacts for free marketing

**Growing your customer list:**
- Ask happy customers to share your number
- Put your number on packaging, receipts
- Print a QR code that opens your WhatsApp chat

WhatsApp Business API (for larger businesses with 1000+ customers) allows chatbots and official verification badge.""",
                level="beginner",
                duration_minutes=18,
                is_published=True,
            ),
            Lesson(
                category_id=cats.get("marketing", 5),
                title="Low-Cost Marketing for Rural Businesses",
                title_hindi="ग्रामीण व्यापार के लिए कम लागत की मार्केटिंग",
                description="Proven marketing strategies that cost almost nothing.",
                youtube_url="https://youtu.be/o4wmG3Q1PL4",
                content="""You don't need a big budget to market your business effectively.

**Free and low-cost strategies:**

**1. Word of Mouth (Most powerful)**
- Ask every happy customer to refer 2 friends
- Offer a small discount for referrals
- Great service is your best marketing

**2. Local Haats and Melas**
- Demo your product where crowds gather
- Offer free samples or trials
- Collect phone numbers for follow-up

**3. Village Noticeboard & Temples**
- Post flyers in high-traffic areas
- Cost: ₹50-200 for printing

**4. Radio (surprising reach)**
- Community FM stations reach rural audiences
- 30-second spot: ₹500-2,000
- Akashvani (All India Radio) has rural programs

**5. Painted Walls (high visibility)**
- Negotiate with homeowners on main roads
- One wall = constant advertising for years
- Cost: ₹1,000-5,000 per wall

**6. School/Temple Sponsorships**
- Sponsor an event, get your name announced
- Builds community trust
- Cost: ₹500-5,000

**7. Customer Loyalty Program**
- Stamp card: buy 10, get 1 free
- Simple but very effective for retention

**8. Seasonal Offers**
- Diwali, harvest season, wedding season discounts
- Creates urgency to buy now""",
                level="beginner",
                duration_minutes=20,
                is_published=True,
            ),
            Lesson(
                category_id=cats.get("legal", 6),
                title="Business Registration in India",
                title_hindi="भारत में व्यापार पंजीकरण",
                description="How and why to legally register your business.",
                youtube_url="https://youtu.be/FlJ5SMdYZO8",
                content="""Registering your business protects you legally and opens doors to loans and government schemes.

**Business structures (simplest to most complex):**

**1. Sole Proprietorship** (Easiest)
- Just you, no separation between personal and business assets
- Register with: Local municipality for trade license
- Cost: ₹500-2,000
- Good for: Very small businesses, street vendors, service providers

**2. Partnership Firm**
- 2-20 partners
- Register: Partnership deed + registration with Registrar of Firms
- Cost: ₹2,000-5,000
- Good for: Family businesses, small shops with partners

**3. OPC (One Person Company)**
- Single owner but separate legal identity
- Registered under Companies Act
- Cost: ₹5,000-15,000
- Good for: Freelancers, consultants wanting corporate structure

**4. Private Limited Company (Pvt Ltd)**
- Most credible structure
- Required for raising investment or VC funding
- Cost: ₹7,000-15,000 (via professional)
- Good for: Growing businesses, startups

**Essential registrations for all businesses:**
- **Udyam Registration** (MSME): Free, get it at udyamregistration.gov.in
  Benefits: Priority lending, government tenders, lower electricity bills
- **GSTIN**: Required if turnover > ₹20 lakh
- **PAN**: Required for all businesses
- **Trade License**: From local municipal body

**Udyam Registration is the most important** — it's free and unlocks MSME benefits worth lakhs.""",
                level="intermediate",
                duration_minutes=22,
                is_published=True,
            ),
            Lesson(
                category_id=cats.get("legal", 6),
                title="Understanding Your Labour Rights",
                title_hindi="अपने श्रम अधिकारों को समझें",
                description="Key labour laws that protect workers and business owners.",
                youtube_url=None,
                content="""Understanding labour laws helps you run your business fairly and avoid legal trouble.

**If you are an EMPLOYEE:**

**Minimum Wages:**
- Every state sets minimum wages for different sectors
- Check your state's minimum wage at labour.gov.in
- Must be paid on time (by 7th of following month)

**Provident Fund (PF):**
- Mandatory if company has 20+ employees
- Employee contributes 12% of basic salary
- Employer matches 12%
- Builds retirement savings

**ESIC (Employee State Insurance):**
- Mandatory for establishments with 10+ employees
- Covers medical treatment for workers earning < ₹21,000/month
- 0.75% deducted from salary, employer pays 3.25%

**Gratuity:**
- Paid after 5 years of continuous service
- 15 days' salary × years of service

**Leave entitlements:**
- Earned Leave: 1 day per 20 days worked
- Sick Leave: 1 day per 20 days (varies by state)

**If you are an EMPLOYER:**

- Issue appointment letters to all employees
- Maintain attendance register
- Cannot make employees work more than 48 hours/week without overtime pay
- Overtime pay: 2x normal hourly wage

**Useful contacts:**
- Labour Commissioner: 1800-11-4444 (toll free)
- eSHRAM portal: Register informal workers for social security""",
                level="intermediate",
                duration_minutes=20,
                is_published=True,
            ),
        ]

        session.add_all(lessons)
        await session.commit()
        logger.info(f"✅ Seeded {len(lessons)} knowledge-base lessons")
