import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import ErrorModal from './ErrorModal';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSend = async () => {
    if (input.trim() === '') return;


    try {
      // User sent empty message
      const response = await axios.post('http://localhost:5000/api/inference', { instructions: input });

      // No response from ai model
      if(!response) {
        console.log('No response from AI model.');
        setErrorMessage('No response from AI model.');
        return;
      }
      
      // Add user message to chat
      const newMessage = { sender: 'user', text: input };
      setMessages([...messages, newMessage]);

      // Add ai message to chat
      const botMessage = { sender: 'bot', text: response.data.response };
      setMessages([...messages, newMessage, botMessage]);

    } catch (error) {
      console.log('Error sending message:', error);
      setErrorMessage('Error sending message: ' + error.message);
    }

    setInput('');
  };

  const closeModal = () => setErrorMessage('');

  return (
    <div className="chat-container">
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      {errorMessage && <ErrorModal message={errorMessage} onClose={closeModal} />}
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default App;
