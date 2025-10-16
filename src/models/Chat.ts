import mongoose from 'mongoose';

export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IChat extends mongoose.Document {
  sessionId: string;
  messages: IChatMessage[];
  customerInfo: {
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
  };
  sessionStatus: 'active' | 'completed' | 'abandoned';
  lastActivity: Date;
  emailSent: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ChatSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  messages: [ChatMessageSchema],
  customerInfo: {
    ipAddress: String,
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  sessionStatus: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active',
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
  completedAt: Date,
}, {
  timestamps: true,
});

// Index for efficient queries
ChatSchema.index({ createdAt: -1 });
ChatSchema.index({ emailSent: 1 });
ChatSchema.index({ sessionStatus: 1 });
ChatSchema.index({ lastActivity: -1 });

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);
