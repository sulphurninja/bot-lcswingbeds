import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PRODUCT_CATALOG = `
SWING BED PRODUCTS:

The Charlotte Swing Bed - $2,995.00
- Premium handcrafted swing bed
- Starting at $104/mo or 0% APR with Affirm
- Available in multiple sizes
- Image: https://www.lcswingbeds.com/wp-content/uploads/2023/07/1442BCAB-A94B-4AC9-AF8C-8F8CEDE3AE59-300x300.jpg

The Cooper River Swing Bed - $2,500.00
- Classic design swing bed
- Starting at $87/mo or 0% APR with Affirm
- Available in multiple sizes
- Image: https://www.lcswingbeds.com/wp-content/uploads/2023/07/Cooper-River-Swing-2-300x300.jpeg

The Edisto Swing Bed - $2,595.00
- Elegant handcrafted design
- Starting at $90/mo or 0% APR with Affirm
- Available in multiple sizes
- Image: https://www.lcswingbeds.com/wp-content/uploads/2024/12/646F329F-EBE8-44A0-99F1-9C87709AE226-300x300.jpeg

The Kiawah Swing Bed - $2,700.00
- Premium coastal-inspired design
- Starting at $94/mo or 0% APR with Affirm
- Available in multiple sizes
- Image: https://www.lcswingbeds.com/wp-content/uploads/2024/12/IMG_6246-300x300.jpg

The Savannah Swing Bed - $2,195.00
- Classic Southern style design
- Starting at $77/mo or 0% APR with Affirm
- Available in multiple sizes
- Image: https://www.lcswingbeds.com/wp-content/uploads/2023/05/the-savannah-swing-bed-1-300x300.jpg

The Sullivan's Island Swing Bed - $2,475.00
- Coastal elegance design
- Starting at $86/mo or 0% APR with Affirm
- Available in multiple sizes
- Image: https://www.lcswingbeds.com/wp-content/uploads/2024/12/IMG_6207-300x300.jpg

The Windermere Swing Bed - $2,575.00
- Sophisticated handcrafted design
- Starting at $90/mo or 0% APR with Affirm
- Available in multiple sizes
- Image: https://www.lcswingbeds.com/wp-content/uploads/2023/05/the-windermere-swing-bed-4-300x300.jpg

SIZING INFORMATION:
- All swing beds available in Twin, Full, Queen, and King sizes
- Custom sizes available upon request
- Porch space recommendations:
  * Twin: Minimum 8x10 porch recommended
  * Full: Minimum 10x12 porch recommended  
  * Queen: Minimum 12x14 porch recommended
  * King: Minimum 14x16 porch recommended
- Allow 2-3 feet clearance on all sides for safe swinging motion
- Consider ceiling height (minimum 8-9 feet recommended)

FINANCING:
- 0% APR financing available through Affirm
- Monthly payment options shown for each product
- Qualification required for financing options
`;

const COMPANY_STORY = `
OUR STORY - WELCOME TO LOWCOUNTRY SWING BEDS:

The Lowcountry Swing Beds story began in 2012 as a testament to the artistry and craftsmanship rooted in Charleston, South Carolina. We take pride in creating exceptional handcrafted swing beds that embody the spirit of the Lowcountry.

OUR ACHIEVEMENTS:
- Serving customers since 2012 (12+ years of experience)
- Over 1,000 satisfied clients
- More than 5,000 transformed outdoor spaces
- 50+ trade partners nationwide
- Featured on the cover of HGTV Magazine
- Published in prestigious publications: Southern California LIFE magazine, Elle Decor, Design Bureau, Charleston Magazine, and Maine Home & Design

OUR PROCESS & CRAFTSMANSHIP:
Our dedication to quality and attention to detail has earned us a reputation that extends beyond our local community. These media features validate our commitment to excellence and the unparalleled craftsmanship in every bed swing we build.

We understand the uniqueness of each client. That's why we go above and beyond to accommodate your preferences. Whether your style is classic, rustic, or contemporary, we have a design that suits your vision.

PERSONALIZED HANGING DAYBEDS:
Designed for Relaxation and Style
With various sizes, wood types, finishes, hanging accessories, and fabric selections, you have the freedom to curate a hanging daybed that perfectly aligns with your distinct design sensibilities and outdoor living space.

Choose Lowcountry Swing Beds to elevate your surroundings with a bed swing that invites you to unwind, enjoy the gentle sway, and savor moments of tranquility. You'll find our dedication to quality, craftsmanship, and personalized service will bring your dreams to life.
`;

const FAQ_DATA = `
FREQUENTLY ASKED QUESTIONS:

Q: Can I hang my swing from 2 points instead of 4?
A: Yes, you can hang your swing bed from 2 points instead of 4, but always hang your swing from 4 points when possible. Remember that the weight limit will only be 640 pounds with a 2-point ceiling connection. With a 4-point ceiling connection, your weight limit would be 1,280 pounds. Each of our ceiling hooks is rated for 320 pounds.

Another consideration is your swing size. If you purchase a larger swing, full-size or above, there may be a tipping factor to adjust or work around when hanging from 2 points only. A 2-point ceiling connection equals more "swing" to your swing. Please leave enough room behind the swing to accommodate the movement.

Q: Where can I see your swing beds?
A: We have a workshop in Charleston, South Carolina, where we handcraft our swing beds; however, the best way to see our finished beds is right here on our website. If you're in the area and would like to visit our workshop, please email us at relax@lcswingbeds.com to request an appointment.

Q: Do you accept custom swing bed orders?
A: We accept custom swing bed orders on a case-by-case basis. Please note that custom orders may be subject to increased production time as well as additional costs. If you have a request or have seen a bed you'd like us to recreate, send us a message through our contact form or email us at relax@lcswingbeds.com. A member of our team will get back to you.

Q: Do you offer designer discounts?
A: Yes! We love working with designers, dealers, and everyone in between. If you are interested in learning more about pricing incentives and details for your company, please send us an email. We do not offer credit terms.

Q: Do you offer on-site consultation?
A: We do not offer on-site consultation; however, if you measure your porch (width by depth) and send us photos along with those measurements at relax@lcswingbeds.com, we will gladly consult with you by email or phone.

Q: Where can you ship swing beds and accessories?
A: We currently ship swing beds and accessories within the contiguous Continental United States. This does not include Hawaii, Alaska, or territories in the Caribbean. Moreover, we are unable to ship to other countries.

Q: How do I adjust the height of my swing bed after the rope has settled?
A: A 1-inch to 1.5-inch rope may settle and stretch more over time than a .75-inch rope, meaning you may need to adjust your swing bed periodically. To adjust it, lift up on both sides of the swing and place a 5-gallon bucket or other sturdy support underneath your swing bed's right and left sides. Once the swing's weight is safely and fully supported by something other than the rope, un-tie each knot, pull the rope tight, and re-tie each knot at a higher location than before. After all four knots are re-tied, you can lift up on each side of the bed swing, remove the supports, and let the swing hang freely. To tighten the knots further, press down on each side of the swing bed until the knots are tight and the bed is level.

Q: How long will it take for my bed swing and cushions to arrive?
A: Our current lead time for delivery is 8-10 weeks for bed swings and 4-6 weeks for cushions. While we do our absolute best to stay on track, situations can occur which may slightly affect this timeline. Keep in mind the cushions will arrive separately from the swing, as they are sewn off-site at another facility, free of sawdust.

We are able to expedite both swings and cushions for an additional fee.

HOLDING FEE: If you are not ready for your swing after the current lead time has passed and your swing is ready to ship, we may charge a holding fee of $50/week. We have a very small warehouse, so it is difficult for us to hold a swing after the current lead time has passed. We have an excess of 100 orders in progress at any given time, so please consider these timelines if your home is under construction.

COMPANY INFORMATION:
- Location: 7218 Peppermill Parkway, North Charleston, SC 29418
- Phone: 843-489-8859
- Email: relax@lcswingbeds.com
- Hours: Monday to Friday: 8 a.m. - 5:30 p.m.
- Current Lead Times: 8-10 Week Standard for swing beds, 4-6 weeks for cushions
- Expedited options available: 2-4 Week for additional fee
- Free Shipping on Qualifying Orders Over $3,000
- Nationwide Shipping in All 50 States (Continental US only)
- BBB Member and Local First Member
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received body:', body); // Debug log
    
    // Handle different possible formats
    let messages;
    if (body.messages && Array.isArray(body.messages)) {
      messages = body.messages;
    } else if (body.message && typeof body.message === 'string') {
      // If single message string is sent, convert to messages array
      messages = [{ role: 'user', content: body.message }];
    } else if (typeof body === 'string') {
      // If body is just a string
      messages = [{ role: 'user', content: body }];
    } else {
      console.log('Invalid format received:', body);
      return NextResponse.json(
        { error: 'Invalid message format. Expected messages array or message string.' },
        { status: 400 }
      );
    }

    const systemMessage = {
      role: 'system' as const,
      content: `You are a helpful customer service assistant for Lowcountry Swing Beds, a company that handcrafts premium swing beds in Charleston, South Carolina. 

You help customers with questions about swing beds, installation, customization, shipping, product selection, and company policies. Always be friendly, professional, and knowledgeable about our rich history and craftsmanship.

IMPORTANT: When discussing specific products, place the image immediately after the product name/title using this format:
**Product Name - Price**
[IMAGE: url]
- Feature 1
- Feature 2

This will display the image right after the product heading, not at the end.

Use this comprehensive information to answer customer questions accurately:

${COMPANY_STORY}

${PRODUCT_CATALOG}

${FAQ_DATA}

Guidelines:
- Share our story when customers ask about the company - we've been crafting swing beds since 2012 with 12+ years of experience
- Mention our media recognition (HGTV Magazine cover, Elle Decor, etc.) when discussing our reputation
- Emphasize our Charleston craftsmanship and Lowcountry heritage
- When showing products, place images immediately after product titles using the format above
- For porch sizing questions, recommend appropriate swing bed sizes based on porch dimensions
- Always prioritize customer safety, especially regarding weight limits and proper installation
- When discussing installation, emphasize the difference between 2-point (640 lbs capacity) and 4-point (1,280 lbs capacity) hanging systems
- Mention lead times when relevant: 8-10 weeks for swing beds, 4-6 weeks for cushions
- Include product pricing and financing options when discussing specific swing beds
- For custom orders or complex questions, direct customers to email relax@lcswingbeds.com or call 843-489-8859
- Be enthusiastic about the handcrafted quality and Charleston craftsmanship
- If customers ask about specific products, provide details including pricing and financing options
- For porch measurements, ask for ceiling height if not provided, as it's important for safety
- Highlight our personalization options - various wood types, finishes, hanging accessories, and fabric selections
- If you don't know something specific, be honest and direct them to contact the company directly

Example format for showing products:
**The Charlotte Swing Bed - $2,995.00**
[IMAGE: https://www.lcswingbeds.com/wp-content/uploads/2023/07/1442BCAB-A94B-4AC9-AF8C-8F8CEDE3AE59-300x300.jpg]
- Premium handcrafted swing bed
- Starting at $104/mo or 0% APR with Affirm
- Available in multiple sizes`
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [systemMessage, ...messages],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return NextResponse.json({
      message: completion.choices[0]?.message?.content || "I'm sorry, I couldn't process your request."
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}