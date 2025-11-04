import dbConnect from '@/lib/mongodb';
import { sendChatEmail } from '@/lib/sendgrid';
import Chat from '@/models/Chat';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey:process.env.OPENAI_API_KEY,
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
A: Our current standard production lead time is 5-7 weeks for bed swings and 3-4 weeks for cushions/swing covers. All other accessories typically ship in 5-8 days. While we do our absolute best to stay on track, situations can occur which may slightly affect this timeline. Keep in mind the cushions will arrive separately from the swing, as they are sewn off-site at another facility, free of sawdust.

We are able to expedite orders for an additional fee. Expedited lead time is 2-4 weeks for swings and 1-2 weeks for cushions/swing covers.

Q: What if I order a swing but don’t need it right away?
A: No worries! We will hold your order in the production pipeline until we are 30-45 days out from your desired delivery date to ensure nothing arrives earlier than needed. Please indicate your preferred delivery timeframe in the order notes as applicable at checkout.

COMPANY INFORMATION:
- Location: 7218 Peppermill Parkway, North Charleston, SC 29418
- Phone: 843-489-8859
- Email: relax@lcswingbeds.com
- Hours: Monday to Friday: 8 a.m. - 5:30 p.m.
- Current Lead Times: 5-7 weeks for swing beds, 3-4 weeks for cushions/covers, 5-8 days for accessories
- Expedited options available: 2-4 Week for additional fee
- Free Shipping on Qualifying Orders Over $3,000
- Nationwide Shipping in All 50 States (Continental US only)
- BBB Member and Local First Member
`;

const INSTALLATION_AND_SETUP = `
SWING SETUP & SPACING GUIDELINES:

CLEARANCE REQUIREMENTS:
- Sides & Back: 10–24 inches clearance recommended
- Front: 20–24 inches clearance recommended

HANGING HEIGHT:
- Approximately 15 inches from ground to swing base
- This targets approximately 24 inches seating height with a 6-inch mattress
- Actual seat height varies by cushion thickness and compression
- Always adjust on site for comfort and safety

COASTAL ENVIRONMENTS - MATERIAL & HARDWARE GUIDANCE:
- For coastal homes, choose tropical hardwood (Mahogany or Teak) or pine with marine-grade finish upgrade
- To reduce corrosion near salt air, minimize exposed metal in the hanging system
- Choose synthetic rope instead of chain or S-hooks when possible
- Customization is available within reason to meet specific needs

HANGING OPTIONS & ROPE CLIMATE NOTES:
- Natural Manila rope is NOT recommended in humid/tropical climates
- Manila rope can breathe/stretch seasonally and change length
- In coastal environments, minimize metal components
- Consider synthetic rope options instead of chains/S-hooks for corrosion resistance
`;

const WARRANTY_AND_POLICIES = `
WARRANTY, RETURNS & SHIPPING DAMAGE:

WARRANTY:
- 1-year warranty against craftsmanship defects on cushions and swings

RETURNS:
- No returns offered

SHIPPING DAMAGE PROCEDURES:
If your swing arrives damaged:
1. If damage is visible before opening, take several photos of the packaging and visible damage
2. If possible, document before accepting delivery so the freight carrier notes the damage
3. Contact our support team with photos and order details at relax@lcswingbeds.com or 843-489-8859

CUSTOM WORK:
- LC Swing Beds is a custom woodshop and may accept non-swing projects on a case-by-case basis
- For requests beyond standard swings, contact our team for a custom quote
`;

const CUSHION_CARE_GUIDE = `
CUSHION CARE & OUTDOOR UPHOLSTERY INSTRUCTIONS:

CORE PRINCIPLES:
- Brush off loose dirt regularly and treat spills as soon as they happen
- Always rinse thoroughly after cleaning to remove soap or cleaner residue
- Air dry only
- Refrain from machine washing as it can damage the stitching - hand/spot clean only

QUICK SPILL RESPONSE (New Spills):
1. Blot, don't rub liquid with a clean, dry cloth
2. For oil-based spills, sprinkle an absorbent (e.g., cornstarch), let it draw out the oil, then lift with a straight edge
3. Spray a mild soap + water solution (see ratios below)
4. Rinse completely
5. Air dry

REMOVABLE CUSHION COVERS:

Hand Washing:
- Mix 1/4 cup mild soap per 1 gallon (3.8 L) lukewarm water
- Soak the cover, then lightly agitate with a sponge or very soft brush
- Rinse thoroughly until water runs clear
- Air dry

Machine Washing (check with furniture maker before removing covers):
- Close all zippers
- Cold water, delicate cycle, normal amount of mild laundry detergent
- For severe mold/mildew: add 1 cup household bleach to the wash
- Air dry (no heat)

NON-REMOVABLE CUSHIONS:
- Mix 1/4 cup mild soap per 1 gallon lukewarm water
- Apply and gently scrub with a soft bristle brush; allow solution to soak in
- Rinse thoroughly to remove all residue
- Air dry
- For tough, colored stains, use a suitable fabric stain/spot remover following label directions, then rinse and air dry
- Clean seam-to-seam across the entire panel instead of scrubbing in circles to avoid water rings
- Using an extractor/wet-vac after rinsing can help prevent rings and residue

MOLD & MILDEW REMOVAL:
- Mildew doesn't grow on the fabric itself but can grow on dirt left on the surface
- Mix 1 cup bleach + 1/4 cup mild soap per 1 gallon water
- Apply to the entire area (not just the spot) and soak ~15 minutes
- Lightly clean with a sponge/towel/very soft brush
- Rinse thoroughly to remove all soap/bleach
- Air dry
- For severe growth, you may increase bleach proportionally
- Safety: Work in a ventilated area, protect surrounding materials from overspray

OIL-BASED STAINS (Grease, Sunscreen, etc.):
- If residue remains after standard cleaning, apply a degreaser or an oil-stain remover rated for outdoor fabrics
- Rinse thoroughly and air dry

DRYING, WRINKLES & HEAT:
- Air dry only
- If wrinkling occurs, use an iron on synthetic setting (test a small, hidden area first)
- Do not steam and do not use a steamer setting

RETREATING/RE-PROTECTING THE FABRIC (Optional):
- Heavy use and repeated deep cleanings can reduce water/stain repellency
- Clean and fully air dry using the methods above
- Apply a reputable outdoor-fabric protector/repellent in a well-ventilated area, following the product's label

DO'S AND DON'TS:
DO:
- Brush off dust/debris routinely
- Treat spills promptly
- Use mild soap solutions and soft tools
- Rinse completely and air dry
- Test heat/ironing on a hidden area first

DON'T:
- Scrub with hard/abrasive brushes
- Skip the rinse step (residue attracts dirt)
- Use steam or high-heat drying
- Clean only a small circle—go seam-to-seam
- Ignore mildew—treat with the proper bleach solution and rinse well
`;

const QUICK_QA = `
QUICK REFERENCE Q&A:

INSTALLATION & SETUP:
Q: Do you offer installation services?
A: We work with an insured third-party installer who services a 150-mile radius around Charleston. If you are unsure if you fall within that radius, please send an inquiry email to relax@lcswingbeds.com with your delivery address.

Q: What clearance do I need around a swing?
A: Sides & back: 10–24 inches; front: 20–24 inches.

Q: What hanging height should I use?
A: About 15 inches from ground for the swing base; this targets ~24 inches seating height with a 6-inch mattress (adjust on site as needed).

Q: What materials do you recommend for coastal homes?
A: Mahogany/Teak or pine with a marine-grade finish upgrade. Minimize exposed metal in the hanging system.

Q: Should I use chain or rope near the coast?
A: Prefer synthetic rope to limit metal exposure (helps reduce corrosion).

Q: Is natural Manila rope okay in humid/tropical places?
A: Not ideal—it tends to stretch/breathe seasonally.

CUSTOMIZATION & ORDERS:
Q: Can you customize swings to my needs?
A: Yes, within reason. The team can tailor solutions for specific requirements.

Q: Do you build non-swing items?
A: Sometimes. As a custom woodshop, non-swing projects are considered case-by-case (human quote required).

POLICIES:
Q: What's the warranty?
A: 1-year against craftsmanship defects on cushions and swings.

Q: Do you accept returns?
A: No returns are offered.

Q: What should I do if my swing is damaged during shipping?
A: Photograph visible damage before accepting delivery if possible, ask the carrier to note the damage, and contact support with photos and order info.

CUSHION CARE:
Q: A drink just spilled on my outdoor cushion. What's my first move?
A: Blot (don't rub) with a dry cloth, apply mild soap + water, rinse thoroughly, and air dry.

Q: How do I hand-wash removable outdoor cushion covers?
A: Soak in 1/4 cup mild soap per gallon lukewarm water, lightly agitate with a soft brush, rinse completely, air dry.

Q: Can I machine-wash the removable covers?
A: Yes, if the furniture maker says it's okay. Close zippers; wash cold, delicate, normal detergent; air dry. For severe mildew, add 1 cup bleach.

Q: How do I clean non-removable outdoor cushions?
A: Apply 1/4 cup mild soap per gallon solution, gently brush, allow to soak, rinse thoroughly, air dry. Clean seam-to-seam to avoid rings.

Q: What's the ratio for removing mold/mildew?
A: 1 cup bleach + 1/4 cup mild soap per 1 gallon water; soak ~15 min, gently clean, rinse thoroughly, air dry. Increase bleach if needed.

Q: Can I use a degreaser for oily stains?
A: Yes—use a fabric-safe degreaser/oil-stain remover, then rinse thoroughly and air dry.

Q: Why do I get water rings?
A: Cleaning in small circles leaves edge residue. Clean entire panels seam-to-seam and consider an extractor/wet-vac after rinsing.

Q: Can I put cushions in the dryer or use steam?
A: No. Air dry only; avoid steam.

Q: Can I iron the fabric?
A: Yes, on synthetic setting only—test a hidden area first.

Q: When should I re-apply a fabric protector?
A: After repeated deep cleanings or years of exposure. Clean and fully dry first, then apply a reputable outdoor-fabric protector per label.
`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Clean up old sessions when new requests come in
async function cleanupOldSessions() {
  try {
    const cutoffTime = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago

    // Find sessions that are still active but haven't had activity in 10+ minutes
    const oldSessions = await Chat.find({
      sessionStatus: 'active',
      lastActivity: { $lt: cutoffTime },
      emailSent: false
    });

    for (const session of oldSessions) {
      const hasUserMessages = session.messages.some((msg: ChatMessage) => msg.role === 'user');

      if (hasUserMessages) {
        // Mark as abandoned - these could be processed later if needed
        session.sessionStatus = 'abandoned';
      } else {
        // No user messages, just mark as abandoned
        session.sessionStatus = 'abandoned';
      }

      await session.save();
    }

    console.log(`Cleaned up ${oldSessions.length} old sessions`);
  } catch (error) {
    console.error('Error cleaning up old sessions:', error);
  }
}
export async function POST(req: NextRequest) {
  try {
    // Run cleanup occasionally (every ~50 requests)
    if (Math.random() < 0.02) { // 2% chance
      cleanupOldSessions();
    }

    const body = await req.json();
    console.log('Received body:', body);

    // Extract session info and customer data
    const sessionId = body.sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Handle different possible formats
    let messages;
    if (body.messages && Array.isArray(body.messages)) {
      messages = body.messages;
    } else if (body.message && typeof body.message === 'string') {
      messages = [{ role: 'user', content: body.message }];
    } else if (typeof body === 'string') {
      messages = [{ role: 'user', content: body }];
    } else {
      console.log('Invalid format received:', body);
      return NextResponse.json(
        { error: 'Invalid message format. Expected messages array or message string.' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find existing chat session or create new one
    let chatSession = await Chat.findOne({ sessionId });


    const systemMessage = {
      role: 'system' as const,
      content: `You are a helpful customer service assistant for Lowcountry Swing Beds, a company that handcrafts premium swing beds in Charleston, South Carolina.

You help customers with questions about swing beds, installation, customization, shipping, product selection, cushion care, and company policies. Always be friendly, professional, and knowledgeable about our rich history and craftsmanship.

IMPORTANT: When discussing specific products, place the image immediately after the product name/title using this format:
**Product Name - Price**
[IMAGE: url]
- Feature 1
- Feature 2

This will display the image right after the product heading, not at the end.

ESCALATION RULES - When to direct customers to human support:
- Customization questions beyond standard options
- Non-swing custom woodworking projects
- Warranty claims or defect issues
- Shipping damage claims
- Complex installation questions beyond provided measurements (anchoring hardware selection, structural concerns)
- Any situation requiring photos, detailed measurements, or custom quotes

For escalations, direct customers to:
- Email: relax@lcswingbeds.com
- Phone: 843-489-8859
- Hours: Monday-Friday, 8 AM - 5:30 PM

Use this comprehensive information to answer customer questions accurately:

${COMPANY_STORY}

${PRODUCT_CATALOG}

${FAQ_DATA}

${INSTALLATION_AND_SETUP}

${WARRANTY_AND_POLICIES}

${CUSHION_CARE_GUIDE}

${QUICK_QA}

Guidelines:
- Share our story when customers ask about the company - we've been crafting swing beds since 2012 with 12+ years of experience
- Mention our media recognition (HGTV Magazine cover, Elle Decor, etc.) when discussing our reputation
- Emphasize our Charleston craftsmanship and Lowcountry heritage
- When showing products, place images immediately after product titles using the format above
- For porch sizing questions, recommend appropriate swing bed sizes and provide specific clearance requirements
- Always prioritize customer safety, especially regarding weight limits, proper installation, and clearance requirements
- When discussing installation, emphasize the difference between 2-point (640 lbs capacity) and 4-point (1,280 lbs capacity) hanging systems
- Provide specific installation guidance: 15" from ground to swing base, 10-24" side/back clearance, 20-24" front clearance
- For coastal environments, specifically recommend Mahogany/Teak or marine-grade pine finish, and synthetic rope over metal components
- For cushion care, provide detailed cleaning instructions and emphasize air-drying only, no machine washing
- Mention lead times when relevant: 8-10 weeks for swing beds, 4-6 weeks for cushions
- Include product pricing and financing options when discussing specific swing beds
- Be clear about our no-returns policy and 1-year craftsmanship warranty
- For shipping damage, provide specific steps: photograph before opening, get carrier to note damage, contact support with photos
- Escalate appropriately based on the escalation rules above
- Be enthusiastic about the handcrafted quality and Charleston craftsmanship
- Highlight our personalization options - various wood types, finishes, hanging accessories, and fabric selections
- If you don't know something specific, be honest and direct them to contact the company directly

Example format for showing products:
**The Charlotte Swing Bed - $2,995.00**
[IMAGE: https://www.lcswingbeds.com/wp-content/uploads/2023/07/1442BCAB-A94B-4AC9-AF8C-8F8CEDE3AE59-300x300.jpg]
- Premium handcrafted swing bed
- Starting at $104/mo or 0% APR with Affirm
- Available in multiple sizes

RECOGNIZED KEYWORDS for common topics:
- Installation/Setup: "spacing", "clearance", "room around swing", "hanging height", "seat height", "ground clearance"
- Coastal: "coastal", "beach house", "salt air", "corrosion", "marine finish", "teak", "mahogany"
- Hardware: "rope options", "synthetic rope", "Manila rope", "chain", "S-hooks"
- Custom Work: "custom", "customization", "non-swing project", "special order"
- Policies: "warranty", "craftsmanship defect", "returns", "refund", "policy"
- Shipping Issues: "shipping damage", "damaged delivery", "freight claim", "photos", "carrier note"
- Cushion Care: "cleaning", "spill", "stain", "mold", "mildew", "wash", "care", "maintenance", "fabric protection", "water rings", "oil stains", "bleach", "soap solution"`
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [systemMessage, ...messages],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const assistantResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process your request.";

    // Add assistant response to messages
    const updatedMessages = [
      ...messages,
      {
        role: 'assistant' as const,
        content: assistantResponse,
        timestamp: new Date()
      }
    ];

    // Save or update chat session in database
    if (!chatSession) {
      // Create new chat session
      chatSession = new Chat({
        sessionId,
        messages: updatedMessages,
        customerInfo: {
          ipAddress: clientIP,
          userAgent: userAgent,
          timestamp: new Date()
        },
        sessionStatus: 'active',
        lastActivity: new Date(),
        emailSent: false
      });
    } else {
      // Update existing session with new messages
      chatSession.messages = updatedMessages;
      chatSession.lastActivity = new Date();
      // Keep session as active since there's new activity
      if (chatSession.sessionStatus === 'abandoned') {
        chatSession.sessionStatus = 'active';
      }
    }

    await chatSession.save();

    // NO IMMEDIATE EMAIL SENDING - emails will be sent when session ends

    return NextResponse.json({
      message: assistantResponse
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
