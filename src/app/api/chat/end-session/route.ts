import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chat from '@/models/Chat';
import { sendChatEmail } from '@/lib/sendgrid';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string | Date;
}

export async function POST(req: NextRequest) {
  try {
    console.log('=== END SESSION ENDPOINT CALLED ===');
    const contentType = req.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    // Handle empty or malformed JSON
    let body;
    try {
      // Check if request has a body
      const text = await req.text();
      console.log('Raw request body length:', text.length);
      console.log('First 100 chars of body:', text.substring(0, 100));
      
      if (!text || text.trim() === '') {
        console.log('Empty request body received');
        return NextResponse.json(
          { error: 'Empty request body' },
          { status: 400 }
        );
      }
      
      // Parse JSON regardless of content-type (sendBeacon might send as text/plain)
      body = JSON.parse(text);
      console.log('Parsed body successfully. SessionId:', body.sessionId, 'Messages count:', body.messages?.length);
    } catch (jsonError) {
      console.error('Invalid JSON in request:', jsonError);
      console.error('JSON Error details:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { sessionId, messages } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the chat session
    const chatSession = await Chat.findOne({ sessionId });

    if (!chatSession) {
      console.log(`Chat session not found for sessionId: ${sessionId}`);
      return NextResponse.json(
        { error: 'Chat session not found' },
        { status: 404 }
      );
    }

    // Only send email if session hasn't been processed yet and has user messages
    const hasUserMessages = chatSession.messages.some((msg: ChatMessage) => msg.role === 'user');

    console.log(`Processing session ${sessionId}: hasUserMessages=${hasUserMessages}, emailSent=${chatSession.emailSent}, status=${chatSession.sessionStatus}`);

    if (!chatSession.emailSent && hasUserMessages && chatSession.sessionStatus === 'active') {
      try {
        // Use the latest messages from the client if provided, otherwise use stored messages
        let messagesToSend = messages && messages.length > 0 ? messages : chatSession.messages;
        
        // Convert ISO string timestamps back to Date objects if needed
        messagesToSend = messagesToSend.map((msg: ChatMessage) => ({
          ...msg,
          timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp
        }));

        console.log(`Sending email for session ${sessionId} with ${messagesToSend.length} messages`);
        console.log(`Environment check - SENDGRID_API_KEY exists: ${!!process.env.SENDGRID_API_KEY}`);
        console.log(`Environment check - SENDGRID_FROM_EMAIL: ${process.env.SENDGRID_FROM_EMAIL}`);
        console.log(`Environment check - SENDGRID_TO_EMAIL: ${process.env.SENDGRID_TO_EMAIL}`);

        const emailSent = await sendChatEmail({
          sessionId: chatSession.sessionId,
          messages: messagesToSend,
          customerInfo: chatSession.customerInfo
        });

        if (emailSent) {
          // Mark session as completed and email sent
          chatSession.sessionStatus = 'completed';
          chatSession.emailSent = true;
          chatSession.completedAt = new Date();
          await chatSession.save();

          return NextResponse.json({
            success: true,
            message: 'Session ended and email sent successfully'
          });
        } else {
          // Mark as completed even if email failed to prevent retry loops
          chatSession.sessionStatus = 'completed';
          await chatSession.save();

          return NextResponse.json({
            success: false,
            message: 'Session ended but email sending failed'
          }, { status: 500 });
        }
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Mark as completed to prevent retry loops
        chatSession.sessionStatus = 'completed';
        await chatSession.save();

        return NextResponse.json({
          success: false,
          message: 'Session ended but email sending failed'
        }, { status: 500 });
      }
    } else {
      // Session already processed or no user messages
      if (!chatSession.emailSent && chatSession.sessionStatus === 'active') {
        chatSession.sessionStatus = hasUserMessages ? 'completed' : 'abandoned';
        await chatSession.save();
      }

      return NextResponse.json({
        success: true,
        message: hasUserMessages ? 'Session already processed' : 'Session had no user messages'
      });
    }

  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
