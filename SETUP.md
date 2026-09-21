# ⚡ Quick Setup Guide

## Step 1: Get API Keys (5 minutes)

### MongoDB
1. Go to: https://mongodb.com/cloud/atlas
2. Create account
3. Create free cluster
4. Click "Connect"
5. Copy connection string: `mongodb+srv://user:password@cluster.mongodb.net/vibe`

### Claude API
1. Go to: https://console.anthropic.com/
2. Sign up/Login
3. Go to API Keys
4. Create new key (copy: `sk-ant-xxxxx`)

## Step 2: Extract Project

1. Download the ZIP file
2. Extract to `C:\Users\abiku\`
3. Rename folder to `vibe-chat-assistant`

## Step 3: Setup Backend

```powershell
cd vibe-chat-assistant\backend
npm install
copy .env.example .env
notepad .env
```

In Notepad, replace:
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/vibe
CLAUDE_API_KEY=sk-ant-xxxxx
PORT=5000
```

Save and close. Then run:
```powershell
npm start
```

You should see:
```
✅ MongoDB Connected
🚀 Server running on http://localhost:5000
```

## Step 4: Setup Frontend (New PowerShell)

```powershell
cd vibe-chat-assistant\frontend
npm install
echo "REACT_APP_BACKEND_URL=http://localhost:5000" > .env
npm start
```

Browser opens at `http://localhost:3000` with chat app!

## Step 5: Test

1. Type a message
2. Click Send
3. Watch response stream character-by-character
4. Change tone and try again
5. See response style change

## Step 6: Push to GitHub

```powershell
cd vibe-chat-assistant
git init
git config user.name "Your Name"
git config user.email "your@email.com"
git add .
git commit -m "initial: complete vibe chat assistant"
git remote add origin https://github.com/YOUR_USERNAME/vibe-chat-assistant.git
git branch -M main
git push -u origin main
```

## ✅ Done!

Your fully functional chat app is now:
- ✅ Running locally
- ✅ Connected to Claude AI
- ✅ Persisting to MongoDB
- ✅ Pushed to GitHub
- ✅ Ready for assessment!

---

**For Sept 21 Assessment:**
1. Run both backend and frontend
2. Test everything works
3. Verify GitHub repo is public
4. Submit link before 10:00 PM on Unstop
