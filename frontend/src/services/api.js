import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api",
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("asktronaut_user"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// AUTH
export const signupAPI = (data) => API.post("/auth/signup", data);
export const loginAPI = (data) => API.post("/auth/login", data);
export const forgotPasswordAPI = (email) => API.post("/auth/forgot-password", { email });
export const resetPasswordAPI = (token, newPassword) => API.post(`/auth/reset-password/${token}`, { newPassword });

// CHAT
export const getAllChatsAPI = () => API.get("/chat/all");
export const createChatAPI = () => API.post("/chat/new");
export const getChatByIdAPI = (id) => API.get(`/chat/${id}`);
export const sendMessageAPI = (id, content) =>
  API.post(`/chat/${id}/message`, { content });

export const sendStreamingMessageAPI = (id, content, signal, isRegenerate = false) => {
  const user = JSON.parse(localStorage.getItem("asktronaut_user"));
  return fetch(`http://localhost:5001/api/chat/${id}/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user?.token || ""}`,
    },
    body: JSON.stringify({ content, isRegenerate }),
    signal, // AbortSignal
  });
};

export const deleteChatAPI = (id) => API.delete(`/chat/${id}`);
export const renameChatAPI = (id, title) =>
  API.patch(`/chat/${id}/title`, { title });
