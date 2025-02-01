import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";
import ErrorModal from "./ErrorModal";
import ExpandableContainer from "./ExpandableContainer";
import ScrollBottomButton from "./ScrollBottomButton";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // TODO add capability for multiple chats

  // Scroll to the newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchStream = async (prompt) => {
    setIsLoading(true);
    const newMessage = { sender: "user", text: prompt };
    setMessages((prev) => [...prev, newMessage]);

    try {
      // Include previous messages in the request
      const formattedMessages = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));
      formattedMessages.push({ role: "user", content: prompt });

      const response = await fetch(
        "http://localhost:1234/v1/chat/completions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "deepseek-r1-distill-llama-8b",
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: -1,
            stream: true,
          }),
        },
      );

      // No response from ai
      if (!response.body) throw new Error("No response body");

      // Get reader ready
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let botText = "";
      let thinkText = "";

      const botMessage = {
        sender: "bot",
        text: "",
        isMarkdown: true,
        thinkText: "",
      };
      setMessages((prev) => [...prev, botMessage]);

      let thinking = false;
      while (true) {
        // Get reader for stream
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        // Split response into lines and process each line separately
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line.trim() || line.includes("[DONE]")) continue;

          try {
            // Removes 'data: ' in front of curly braces of json
            const jsonData = JSON.parse(line.replace(/^data: /, "").trim());
            const content = jsonData.choices[0]?.delta?.content || "";

            // Save "thinking" section of bot response separately
            if (content === "<think>") {
              thinking = true;
              continue;
            } else if (content === "</think>") {
              thinking = false;
              continue;
            }
            if (thinking) {
              thinkText += content;
            } else {
              botText += content;
            }

            // Append bot text to current chat message
            setMessages((prev) => {
              const updatedMessages = [...prev];
              updatedMessages[updatedMessages.length - 1] = {
                ...botMessage,
                text: botText,
                thinkText,
              };
              return updatedMessages;
            });
          } catch (error) {
            console.warn("Skipping invalid JSON chunk:", line);
          }
        }
      }
    } catch (error) {
      console.error("Error streaming message:", error);
      setErrorMessage("Error streaming message: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    // No input from user or still loading
    if (input.trim() === "" || isLoading) return;
    // process ai response
    await fetchStream(input);
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
            {msg.thinkText?.trim() && (
              <ExpandableContainer
                message={msg.thinkText}
                title="Click to expand thinking section"
              ></ExpandableContainer>
            )}
            {msg.isMarkdown ? (
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            ) : (
              msg.text
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
        {/* This ensures scrolling to the latest message */}
      </div>
      <ScrollBottomButton bottomElement={messagesEndRef} />
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
        <button
          className="submit-button"
          onClick={handleSend}
          disabled={isLoading}
        >
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
