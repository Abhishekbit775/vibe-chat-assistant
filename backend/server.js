const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Schema
const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  threadId: { type: String, unique: true, required: true },
  tone: { type: String, enum: ['Professional', 'Casual', 'Concise'], default: 'Professional' },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Conversation = mongoose.model('Conversation', conversationSchema);

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Error:', error.message);
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Tone System Prompts
const TONE_PROMPTS = {
  'Professional': 'Respond in a professional, formal, and business-like tone. Use technical terminology where appropriate.',
  'Casual': 'Respond in a friendly, conversational, and casual tone. Use natural language and emojis if appropriate.',
  'Concise': 'Respond with brief, to-the-point answers. Avoid unnecessary details. Keep responses short and clear.'
};

// Helper: Build system instruction based on tone
const getSystemInstruction = (tone) => {
  return `You are a helpful AI assistant. ${TONE_PROMPTS[tone] || TONE_PROMPTS['Professional']}`;
};

// API Routes
// POST: Send message and get AI response
app.post('/api/chat/send-message', async (req, res) => {
  try {
    const { threadId, userId, message, tone = 'Professional' } = req.body;

    if (!message || !threadId || !userId) {
      return res.status(400).json({ error: 'Missing required fields: message, threadId, userId' });
    }

    let conversation = await Conversation.findOne({ threadId });
    
    if (!conversation) {
      conversation = new Conversation({
        userId,
        threadId,
        tone,
        messages: []
      });
    } else {
      conversation.tone = tone;
    }

    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    const systemInstruction = getSystemInstruction(tone);
    const apiMessages = conversation.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    let aiResponse = '';
    
    try {
      const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemInstruction,
        messages: apiMessages
      }, {
        headers: {
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      });

      aiResponse = response.data.content[0].text;
    } catch (apiError) {
      console.error('API Error:', apiError.message);
      aiResponse = `[${tone}] I'm currently unable to connect to the AI service. Please try again later.`;
    }

    conversation.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });

    await conversation.save();

    res.json({
      success: true,
      threadId,
      tone,
      aiResponse,
      messageCount: conversation.messages.length
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process message', details: error.message });
  }
});

// GET: Retrieve conversation thread
app.get('/api/chat/thread/:threadId', async (req, res) => {
  try {
    const { threadId } = req.params;
    const conversation = await Conversation.findOne({ threadId });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ success: true, conversation });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve thread' });
  }
});

// GET: List all conversation threads for a user
app.get('/api/chat/threads/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await Conversation.find({ userId }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      threads: conversations.map(conv => ({
        threadId: conv.threadId,
        tone: conv.tone,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        messageCount: conv.messages.length
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve threads' });
  }
});

// PUT: Update tone for existing conversation
app.put('/api/chat/thread/:threadId/tone', async (req, res) => {
  try {
    const { threadId } = req.params;
    const { tone } = req.body;

    if (!['Professional', 'Casual', 'Concise'].includes(tone)) {
      return res.status(400).json({ error: 'Invalid tone' });
    }

    const conversation = await Conversation.findOneAndUpdate(
      { threadId },
      { tone },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ success: true, tone: conversation.tone });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update tone' });
  }
});

// DELETE: Delete conversation thread
app.delete('/api/chat/thread/:threadId', async (req, res) => {
  try {
    const { threadId } = req.params;
    await Conversation.deleteOne({ threadId });
    res.json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete thread' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running!', timestamp: new Date() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Vibe Chat Assistant API',
    version: '1.0.0',
    endpoints: {
      sendMessage: 'POST /api/chat/send-message',
      getThread: 'GET /api/chat/thread/:threadId',
      getThreads: 'GET /api/chat/threads/:userId',
      updateTone: 'PUT /api/chat/thread/:threadId/tone',
      deleteThread: 'DELETE /api/chat/thread/:threadId'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
