import React from 'react';
import './ErrorModal.css';

const ErrorModal = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <span className="close" onClick={onClose}>&times;</span>
        </div>
        <div className="modal-content">
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
