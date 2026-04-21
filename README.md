# 🚀 Asktronaut — AI Chatbot

<div align="center">

![Asktronaut Banner](https://img.shields.io/badge/Asktronaut-AI%20Chatbot-7c3aed?style=for-the-badge&logo=rocket&logoColor=white)

**Explore the Universe of AI with Asktronaut**

*Smart conversations. Context-aware responses. Your personal AI assistant.*

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)](https://mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-AI%20API-7c3aed?style=flat-square)](https://openrouter.ai/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)



</div>

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [How It Works](#-how-it-works)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌌 About the Project

**Asktronaut** is a full-stack AI chatbot web application built with the **MERN stack** (MongoDB, Express, React, Node.js). It provides a ChatGPT-like experience powered by free AI models via the **OpenRouter API**.

Users can sign up, create multiple chat sessions, and have context-aware conversations with an AI — all chat history is saved persistently to MongoDB so users can pick up right where they left off.

> Built as a production-ready, scalable, and secure application with clean architecture and a modern futuristic UI.

---

## ✨ Features

### 🔐 Authentication
- User **Signup & Login** with email and password
- **JWT-based** authentication (7-day token expiry)
- **bcrypt** password hashing for security
- Protected routes — chat is accessible only when logged in
- Persistent login via `localStorage`

### 💬 Chat System
- **ChatGPT-like** chat interface
- **Multiple chat sessions** per user (like ChatGPT's sidebar)
- Create, switch, and delete chat sessions
- Chat titles auto-generated from first message
- Messages stored persistently in MongoDB

### 🧠 Context-Aware AI
- Sends **full conversation history** to the AI on every message
- AI understands follow-up questions and references
- Powered by **Mistral 7B Instruct** (free) via OpenRouter
- Easily swap to any OpenRouter-supported model

### 🎨 Premium UI
- **Futuristic dark theme** with glassmorphism effects
- Animated gradient blobs and star field background
- Fully **responsive** — works on mobile and desktop
- Smooth transitions, hover effects, and loading animations
- Bouncing dot loader while waiting for AI response

### ⚡ Performance & UX
- Optimistic UI updates (user message appears instantly)
- Auto-scroll to latest message
- Enter to send, Shift+Enter for new line
- Show/hide password toggle
- User-friendly error messages for all failure cases

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router DOM |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **AI Integration** | OpenRouter API (Mistral 7B Instruct — free) |
| **HTTP Client** | Axios |
| **Dev Tools** | Nodemon, Vite HMR |

---


## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** v18+ → [Download](https://nodejs.org/)
- **npm** v9+ (comes with Node.js)
- **MongoDB Atlas** account (free) → [Sign up](https://cloud.mongodb.com/)
- **OpenRouter** account (free) → [Sign up](https://openrouter.ai/)

---

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/your-username/asktronaut.git
cd asktronaut
```

**2. Install Backend dependencies**

```bash
cd backend
npm install
```

**3. Install Frontend dependencies**

```bash
cd ../frontend
npm install
```

---

### Environment Variables

Create a `.env` file inside the `backend/` folder:

```bash
cd backend
touch .env
```

Add the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

| Variable | Description | Where to Get |
|---|---|---|
| `PORT` | Backend server port | Default: `5000` |
| `MONGO_URI` | MongoDB connection string | [MongoDB Atlas](https://cloud.mongodb.com) → Connect → Drivers |
| `JWT_SECRET` | Secret key for JWT signing | Any random string e.g. `asktronaut_secret_2024` |
| `OPENROUTER_API_KEY` | API key for AI model access | [openrouter.ai/keys](https://openrouter.ai/keys) |

> ⚠️ **Never commit `.env` to GitHub.** It's already in `.gitignore`.

---

### Running the App

**Start the Backend** (from `/backend` folder):

```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB Connected: ac-xxxxxxx.mongodb.net
```

**Start the Frontend** (from `/frontend` folder, in a new terminal):

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x ready in 300ms
➜  Local:   http://localhost:5173/
```

**Open your browser:**

```
http://localhost:5173
```

---



## 🧠 How It Works

```
User types a message
        ↓
Frontend sends POST /api/chat/:id/message
        ↓
Backend fetches all previous messages from MongoDB
        ↓
Sends full conversation history to OpenRouter API
  [
    { role: "user", content: "Hello" },
    { role: "assistant", content: "Hi!" },
    { role: "user", content: "New message..." }
  ]
        ↓
OpenRouter returns AI response (Mistral 7B)
        ↓
Backend saves both messages to MongoDB
        ↓
Returns AI response to frontend
        ↓
Frontend displays message in chat UI
```

This context-passing approach ensures the AI **remembers the conversation** and can handle follow-up questions intelligently.

---

## ☁️ Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
# Deploy /dist folder to Vercel
```

Or connect your GitHub repo to [vercel.com](https://vercel.com) for auto-deploy.

### Backend → Render

1. Push backend to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node server.js`
6. Add all `.env` variables in the Environment section

### Database → MongoDB Atlas

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster
3. Get connection string → paste into `MONGO_URI`
4. Whitelist IP: `0.0.0.0/0` for cloud deployment

> 🔁 After deploying backend, update `frontend/src/services/api.js`:
> ```js
> baseURL: 'https://your-backend-url.onrender.com/api'
> ```

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** your feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open** a Pull Request

---

## 🗺️ Roadmap

- [x] User authentication (JWT + bcrypt)
- [x] Multiple chat sessions
- [x] Context-aware AI responses
- [x] Persistent chat history
- [x] Responsive UI with glassmorphism
- [ ] Streaming responses (real-time typing effect)
- [ ] Markdown rendering in chat messages
- [ ] Dark / Light mode toggle
- [ ] Rename chat sessions
- [ ] Voice input / output
- [ ] File upload (chat with PDFs)
- [ ] Multi-model switching (GPT-4, Claude, Gemini)
- [ ] User profile & settings page

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 🙏 Acknowledgements

- [OpenRouter](https://openrouter.ai/) — Free AI model API access
- [Mistral AI](https://mistral.ai/) — The underlying AI model
- [MongoDB Atlas](https://cloud.mongodb.com/) — Free cloud database
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework
- [Vite](https://vitejs.dev/) — Lightning fast frontend tooling

---

<div align="center">

Made with ❤️ and ☕ by **[Your Name](https://github.com/your-username)**

⭐ **Star this repo if you found it helpful!** ⭐

</div>
