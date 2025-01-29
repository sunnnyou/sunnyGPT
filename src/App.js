import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import ErrorModal from "./ErrorModal";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    // No input from user or still loading
    if (input.trim() === "" || isLoading) return;

    setIsLoading(true);

    try {
      // Get response from ai
      const response = await axios.post(
        "http://localhost:1234/v1/chat/completions",
        {
          model: "deepseek-r1-distill-llama-8b",
          messages: [
            {
              role: "system",
              content: "",
            },
            { role: "user", content: input },
          ],
          temperature: 0.7,
          max_tokens: -1,
          stream: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      // No response from ai
      if (!response) {
        console.log("No response from AI model.");
        setErrorMessage("No response from AI model.");
        return;
      }

      // trim content from ai
      const fullContent = response.data.choices[0].message.content;
      const extractedContent = fullContent
        .replace(/<think>.*?<\/think>/s, "")
        .trim();

      // Add user message and ai response to chat
      const newMessage = { sender: "user", text: input };
      const botMessage = { sender: "bot", text: extractedContent };
      setMessages([...messages, newMessage, botMessage]);
    } catch (error) {
      console.log("Error sending message:", error);
      setErrorMessage("Error sending message: " + error.message);
    } finally {
      setIsLoading(false);
    }

    // Remove text in input field
    setInput("");
  };

  // on close, remove error message, which removes the modal div
  const closeModal = () => setErrorMessage("");

  return (
    <div className="chat-container">
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      {errorMessage && (
        <ErrorModal message={errorMessage} onClose={closeModal} />
      )}
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyUp={(e) => e.key === "Enter" && handleSend()}
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading}>
          {isLoading ? (
            <div className="loader-container">
              <span className="loader"></span>
            </div>
          ) : (
            "Send"
          )}
        </button>
      </div>
    </div>
  );
}

export default App;
