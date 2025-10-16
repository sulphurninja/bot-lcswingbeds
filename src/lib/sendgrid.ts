import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY!;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL!;
const TO_EMAIL = process.env.SENDGRID_TO_EMAIL!;

if (!SENDGRID_API_KEY) {
  throw new Error('Please define the SENDGRID_API_KEY environment variable');
}

if (!FROM_EMAIL) {
  throw new Error('Please define the SENDGRID_FROM_EMAIL environment variable');
}

if (!TO_EMAIL) {
  throw new Error('Please define the SENDGRID_TO_EMAIL environment variable');
}

sgMail.setApiKey(SENDGRID_API_KEY);

export interface ChatEmailData {
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  customerInfo: {
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
  };
}

export async function sendChatEmail(chatData: ChatEmailData): Promise<boolean> {
  try {
    // Format messages for email
    const formattedMessages = chatData.messages
      .map((msg, index) => {
        const time = msg.timestamp.toLocaleString();
        const role = msg.role === 'user' ? '👤 Customer' : '🤖 Assistant';
        return `
${index + 1}. ${role} (${time}):
${msg.content}
`;
      })
      .join('\n---\n');

    const emailHtml = `
    <h2>New Customer Chat Session</h2>
    <p><strong>Session ID:</strong> ${chatData.sessionId}</p>
    <p><strong>Started:</strong> ${chatData.customerInfo.timestamp.toLocaleString()}</p>
    <p><strong>IP Address:</strong> ${chatData.customerInfo.ipAddress || 'Unknown'}</p>
    <p><strong>User Agent:</strong> ${chatData.customerInfo.userAgent || 'Unknown'}</p>
    <p><strong>Total Messages:</strong> ${chatData.messages.length}</p>

    <h3>Chat Conversation:</h3>
    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; font-family: monospace; white-space: pre-wrap;">
${chatData.messages.map((msg, index) => {
  const time = msg.timestamp.toLocaleString();
  const role = msg.role === 'user' ? '👤 <strong>Customer</strong>' : '🤖 <strong>Assistant</strong>';
  return `<div style="margin-bottom: 20px; padding: 10px; background: ${msg.role === 'user' ? '#e3f2fd' : '#f3e5f5'}; border-radius: 5px;">
<div style="font-size: 12px; color: #666; margin-bottom: 5px;">${index + 1}. ${role} (${time}):</div>
<div>${msg.content.replace(/\n/g, '<br>')}</div>
</div>`;
}).join('')}
    </div>

    <hr>
    <p style="font-size: 12px; color: #666;">
      This email was automatically generated from the Lowcountry Swing Beds chat interface.
    </p>
    `;

    const emailText = `
New Customer Chat Session

Session ID: ${chatData.sessionId}
Started: ${chatData.customerInfo.timestamp.toLocaleString()}
IP Address: ${chatData.customerInfo.ipAddress || 'Unknown'}
User Agent: ${chatData.customerInfo.userAgent || 'Unknown'}
Total Messages: ${chatData.messages.length}

Chat Conversation:
${formattedMessages}

---
This email was automatically generated from the Lowcountry Swing Beds chat interface.
    `;

    const msg = {
      to: TO_EMAIL,
      from: FROM_EMAIL,
      subject: `New Customer Chat - Session ${chatData.sessionId}`,
      text: emailText,
      html: emailHtml,
    };

    await sgMail.send(msg);
    console.log(`Chat email sent successfully for session: ${chatData.sessionId}`);
    return true;
  } catch (error) {
    console.error('Error sending chat email:', error);
    return false;
  }
}
