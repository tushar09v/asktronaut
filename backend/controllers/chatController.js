const Chat = require("../models/Chat");
const { getAIResponse, streamAIResponse } = require("../utils/openRouter");

// @route   GET /api/chat/all
const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .select("_id title createdAt")
      .sort({ createdAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};

// @route   POST /api/chat/new
const createChat = async (req, res) => {
  try {
    const chat = await Chat.create({
      userId: req.user._id,
      title: "New Chat",
      messages: [],
    });

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: "Failed to create chat" });
  }
};

// @route   GET /api/chat/:id
const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chat" });
  }
};

// @route   POST /api/chat/:id/message
const sendMessage = async (req, res) => {
  const { content, isRegenerate } = req.body;

  if (!content || content.trim() === "") {
    return res.status(400).json({ message: "Message content is required" });
  }

  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (isRegenerate) {
      if (
        chat.messages.length > 0 &&
        chat.messages[chat.messages.length - 1].role === "assistant"
      ) {
        chat.messages.pop();
      }
    } else {
      // Add new user message
      chat.messages.push({ role: "user", content });
    }

    // ---------------- TITLE LOGIC ----------------
    let updatedTitle = chat.title;
    if (!isRegenerate) {
      const userMsgCount = chat.messages.filter(m => m.role === "user").length;

      if (userMsgCount === 1) {
        updatedTitle = content.slice(0, 40) + (content.length > 40 ? "..." : "");
        chat.title = updatedTitle;
      } else if (userMsgCount === 2 && chat.title.length <= 43) {
        try {
          const userMsgs = chat.messages
            .filter(m => m.role === "user")
            .slice(0, 2);

          const titlePrompt = [
            {
              role: "user",
              content: `Summarize the intent in 3-6 words (no punctuation):
Message 1: ${userMsgs[0].content}
Message 2: ${userMsgs[1].content}`
            }
          ];

          const generatedTitle = await getAIResponse(titlePrompt);
          const cleaned = generatedTitle.replace(/["'`.!?]/g, "").trim();

          if (cleaned.length > 0 && cleaned.length <= 60) {
            updatedTitle = cleaned;
            chat.title = updatedTitle;
          }
        } catch (e) {
          console.error("Auto-title failed:", e.message);
        }
      }
    }

    await chat.save();

    // ---------------- SSE HEADERS ----------------
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    res.write(
      `data: ${JSON.stringify({
        type: "init",
        userMessage: { role: "user", content },
        updatedTitle,
      })}\n\n`
    );

    // 🔥 FIX 2: CLEAN CONTEXT (NO HACKS)
    const contextMessages = [
      {
        role: "system",
        content: "You are Asktronaut, a helpful AI assistant. Always prioritize responding to the user's most recent message. If the user abruptly changes the topic, answer the new topic independently and DO NOT merge it with previous unfinished thoughts, formats, or poems. Encourage natural use of emojis in your responses for clarity and tone (e.g., ✅, ⚠️, 🚀), but do not overuse them and maintain professionalism.",
      },
      ...chat.messages.map(msg => ({
        role: msg.role,
        content: msg.isAborted ? msg.content + "\n\n[Message interrupted by user]" : msg.content,
      })),
    ];

    // ---------------- ABORT HANDLING ----------------
    const abortController = new AbortController();

    req.on("close", () => {
      abortController.abort();
    });

    let aiResponseContent = "";

    try {
      await streamAIResponse(
        contextMessages,
        (chunkText) => {
          aiResponseContent += chunkText;

          res.write(
            `data: ${JSON.stringify({
              type: "chunk",
              content: chunkText,
            })}\n\n`
          );
        },
        abortController.signal
      );
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("🛑 Generation stopped");
      } else {
        throw err;
      }
    }

    // 🔥 FIX 3: Save partial content even if aborted
    if (aiResponseContent.trim().length > 0) {
      chat.messages.push({
        role: "assistant",
        content: aiResponseContent,
        isAborted: abortController.signal.aborted,
      });

      await chat.save();
    }

    // ---------------- DONE ----------------
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();
    }

  } catch (error) {
    console.error("Send message error:", error.message);

    if (!res.headersSent) {
      res.status(500).json({
        message: "Failed to get AI response",
      });
    } else {
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          message: "Failed to get AI response",
        })}\n\n`
      );
      res.end();
    }
  }
};

// @route   PATCH /api/chat/:id/title
const renameChat = async (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "Title is required" });
  }

  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    chat.title = title.trim().slice(0, 80);
    await chat.save();

    res.json({ title: chat.title });
  } catch (error) {
    res.status(500).json({ message: "Failed to rename chat" });
  }
};

// @route   DELETE /api/chat/:id
const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json({ message: "Chat deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete chat" });
  }
};

module.exports = {
  getAllChats,
  createChat,
  getChatById,
  sendMessage,
  renameChat,
  deleteChat,
};