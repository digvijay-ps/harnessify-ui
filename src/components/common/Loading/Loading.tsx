import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import './Loading.css';

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <FaSpinner className="loading-spinner" />
      <p className="loading-message">{message}</p>
    </div>
  );
};

export default Loading;
