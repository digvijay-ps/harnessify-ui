import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import './Error.css';

interface ErrorProps {
  message: string;
  onRetry?: () => void;
}

const Error: React.FC<ErrorProps> = ({ message, onRetry }) => {
  return (
    <div className="error-container">
      <FaExclamationTriangle className="error-icon" />
      <p className="error-message">{message}</p>
      {onRetry && (
        <button className="error-retry-button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
};

export default Error;
