import React, { useState } from 'react';
import { FaCopy, FaCheck } from 'react-icons/fa';
import './YamlViewer.css';

interface YamlViewerProps {
  yaml: string;
}

const YamlViewer: React.FC<YamlViewerProps> = ({ yaml }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(yaml).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="yaml-viewer">
      <div className="yaml-toolbar">
        <button 
          className="copy-button" 
          onClick={handleCopy}
          aria-label="Copy YAML to clipboard"
        >
          {copied ? <FaCheck /> : <FaCopy />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="yaml-content">
        <code>{yaml}</code>
      </pre>
    </div>
  );
};

export default YamlViewer;
