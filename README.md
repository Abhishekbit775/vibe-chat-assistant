# 🎭 Vibe Chat Assistant

An intelligent chat interface with **real-time streaming** capabilities and **tone customization** (Professional, Casual, Concise). Built for the Quantiphi **Vibe Coding Round**.

## ✨ Features

- ✅ **Real-time Streaming**: Character-by-character text rendering
- ✅ **Tone Toggle**: Professional → Casual → Concise
- ✅ **Conversation History**: Persistent storage with MongoDB
- ✅ **Multi-thread Support**: Manage multiple conversation threads
- ✅ **Clean Architecture**: Separation of frontend/backend concerns
- ✅ **API Integration**: Claude AI API with system instruction modifiers
- ✅ **Responsive Design**: Works on desktop and mobile

## 📋 Tech Stack

### Backend
- **Node.js** + **Express.js**
- **MongoDB** (Mongoose ODM)
- **Claude API** (Anthropic)
- **Axios** for HTTP requests

### Frontend
- **React 18.2**
- **CSS3** (Responsive)
- **Axios** for API calls

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MongoDB (local or cloud instance)
- Claude API Key

### 1️⃣ Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials:
# MONGODB_URI=mongodb://localhost:27017/vibe-chat-assistant
# CLAUDE_API_KEY=your_api_key_here
# PORT=5000

npm start
# Server runs on http://localhost:5000
```

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install

# Create .env file
echo "REACT_APP_BACKEND_URL=http://localhost:5000" > .env

npm start
# App runs on http://localhost:3000
```

## 📁 Project Structure

```
vibe-chat-assistant/
├── backend/
│   ├── server.js              # Express server with MongoDB
│   ├── package.json           # Dependencies
│   └── .env.example           # Config template
├── frontend/
│   ├── App.jsx                # React component
│   ├── App.css                # Styling
│   ├── index.js               # Entry point
│   ├── public/
│   │   └── index.html
│   └── package.json
├── .gitignore
└── README.md
```

## 🔌 API Endpoints

### Chat Operations
- `POST /api/chat/send-message` - Send message with tone
- `GET /api/chat/thread/:threadId` - Get conversation
- `GET /api/chat/threads/:userId` - List user's threads
- `PUT /api/chat/thread/:threadId/tone` - Update tone
- `DELETE /api/chat/thread/:threadId` - Delete conversation

### Health Check
- `GET /api/health` - Server status
- `GET /` - API documentation

## 💡 Key Features Explained

### Tone System
The tone preference is passed as a **system instruction modifier** to the Claude API:

```javascript
const systemInstruction = `You are a helpful AI assistant. ${TONE_PROMPTS[tone]}`;
```

This changes response style **instantly** without re-prompting.

### Streaming View
Messages appear character-by-character to simulate real-time processing:

```javascript
const streamMessage = (text) => {
  let charIndex = 0;
  const interval = setInterval(() => {
    streamedText += text[charIndex];
    setMessages(prev => [...prev, { content: streamedText }]);
    charIndex++;
  }, 10); // 10ms per character
};
```

### MongoDB Persistence
Each conversation stores:
- User prompts
- AI responses
- Timestamp
- Selected tone
- Thread ID

## 🔐 Security Notes

- API keys stored in `.env` (not committed)
- MongoDB connection requires auth
- CORS enabled for frontend
- No sensitive data in logs

## 📝 Git Workflow

```bash
git add .
git commit -m "feat: setup backend Express server"
git commit -m "feat: implement tone system"
git commit -m "feat: build frontend React interface"
git commit -m "feat: add streaming animation"
git commit -m "docs: add comprehensive documentation"
git push origin main
```

## 🎯 Submission Checklist

- [ ] Backend running on `http://localhost:5000`
- [ ] Frontend running on `http://localhost:3000`
- [ ] MongoDB connected
- [ ] Claude API key configured
- [ ] All endpoints tested
- [ ] Streaming works smoothly
- [ ] Tone toggle changes responses
- [ ] History sidebar functional
- [ ] Git commits meaningful
- [ ] Repository PUBLIC
- [ ] GitHub link submitted before 10:00 PM

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Solution: Ensure MongoDB is running
- Local: mongod
- Atlas: Check MONGODB_URI in .env
```

### Claude API Error
```
Solution: Verify API key
- Get key from https://console.anthropic.com
- Check quota available
```

### Frontend Can't Connect to Backend
```
Solution: Check CORS and URLs
- Backend on http://localhost:5000
- Frontend REACT_APP_BACKEND_URL set correctly
```

## 📊 Performance Tips

- Character streaming: 10ms per character
- MongoDB indexes on userId and threadId
- Frontend debouncing on tone changes

## 🎓 Learning Outcomes

This project demonstrates:
- **Full-stack development** (Node.js + React)
- **API integration** (Claude AI)
- **Real-time features** (streaming text)
- **Database design** (MongoDB)
- **State management** (React hooks)
- **UI/UX** (Responsive design)

## 📜 License

Built for Quantiphi Vibe Coding Round - 21st Sept 2024

---

**Made with ❤️ for the assessment** | Good luck! 🚀
