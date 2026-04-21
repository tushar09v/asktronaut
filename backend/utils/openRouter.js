const axios = require("axios");

/**
 * Send messages to OpenRouter API and get AI response
 * @param {Array} messages - Array of {role, content} objects
 * @returns {String} - AI response text
 */
const getAIResponse = async (messages) => {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/auto", // Free model
        messages: messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5001", // Required by OpenRouter
          "X-Title": "Asktronaut",
        },
      },
    );

    // Extract the AI message content
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      "OpenRouter API Error:",
      error.response?.data || error.message,
    );
    throw new Error("Failed to get AI response");
  }
};

/**
 * Send messages to OpenRouter API and stream the AI response back
 * @param {Array} messages - Array of {role, content} objects
 * @param {Function} onChunk - Callback fired with each text chunk
 * @param {AbortSignal} signal - AbortSignal to cancel the request
 * @returns {Promise<String>} - The completed full text
 */
const streamAIResponse = async (messages, onChunk, signal) => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5001",
        "X-Title": "Asktronaut",
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: messages,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`OpenRouter HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullContent = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      
      // Keep the last partial line in the buffer
      buffer = lines.pop();

      for (const line of lines) {
        if (line.startsWith("data: ") && line !== "data: [DONE]") {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.choices && data.choices[0]?.delta?.content) {
              const text = data.choices[0].delta.content;
              fullContent += text;
              onChunk(text);
            }
          } catch (e) {
            // Error parsing this specific chunk, usually ignored as it might not be JSON
          }
        }
      }
    }

    return fullContent;
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("OpenRouter stream aborted by client");
      throw error;
    }
    console.error("OpenRouter Stream Error:", error.message);
    throw new Error("Failed to get streaming AI response");
  }
};

module.exports = { getAIResponse, streamAIResponse };
