const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getAllChats,
  createChat,
  getChatById,
  sendMessage,
  renameChat,
  deleteChat,
} = require("../controllers/chatController");

router.get("/all", protect, getAllChats);
router.post("/new", protect, createChat);
router.get("/:id", protect, getChatById);
router.post("/:id/message", protect, sendMessage);
router.patch("/:id/title", protect, renameChat);
router.delete("/:id", protect, deleteChat);

module.exports = router;
