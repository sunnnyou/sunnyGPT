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
    const newMessage = { sender: 'user', text: input };
    setMessages([...messages, newMessage]);

    try {
      const response = await axios.post('http://localhost:5000/api/inference', { instructions: input });
      const botMessage = { sender: 'bot', text: response.data.response };
      setMessages([...messages, newMessage, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
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
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default App;
