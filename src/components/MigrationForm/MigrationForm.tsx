import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaSpinner } from 'react-icons/fa';
import { useApi } from '../../services/api';
import { useMigration } from '../../context/MigrationContext';
import { TOOL_CONFIGS } from '../../utils';
import { Migration } from '../../types';
import './MigrationForm.css';

interface ToolConfig {
  agentId: string;
  key: string;
  accept: string;
  name: string;
}

const MigrationForm: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<string>('Spinnaker');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiErrorDetails, setApiErrorDetails] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { addMigration } = useMigration();
  const api = useApi();

  const handleToolChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedTool(e.target.value);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFileContent('');
    setFileName('');
    setError(null);
    setApiErrorDetails(null);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFileAsText(file);
      setFileContent(content);
      setFileName(file.name);
      setError(null);
      setApiErrorDetails(null);
    } catch (err) {
      setError('Failed to read file. Please try again.');
      console.error('Error reading file:', err);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setFileContent(e.target.value);
    setError(null);
    setApiErrorDetails(null);
  };

  const validateFileContent = (content: string, tool: string): boolean => {
    const toolConfig = TOOL_CONFIGS[tool] as ToolConfig;
    if (toolConfig.accept.includes('json')) {
      try {
        JSON.parse(content);
        return true;
      } catch {
        setError('Invalid JSON format. Please check your file content.');
        return false;
      }
    } else if (toolConfig.accept.includes('yml') || toolConfig.accept.includes('yaml')) {
      if (content.includes(': \n') || content.includes(':\n')) {
        setError('Possible YAML syntax error. Please check your file content.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!api.isAuthenticated) {
      setError('Authentication required. Please check your API token.');
      return;
    }

    if (!fileContent.trim()) {
      setError('Please provide file content');
      return;
    }

    if (!validateFileContent(fileContent, selectedTool)) return;

    setIsLoading(true);
    setError(null);
    setApiErrorDetails(null);

    try {
      const toolConfig = TOOL_CONFIGS[selectedTool] as ToolConfig;
      const correlationId = await api.submitMigration(
        toolConfig.agentId,
        toolConfig.key,
        fileContent
      );

      const newMigration: Migration = {
        id: correlationId,
        correlationId,
        name: fileName || `${selectedTool} Migration ${new Date().toLocaleString()}`,
        tool: selectedTool,
        timestamp: Date.now(),
        status: 'in-progress'
      };

      addMigration(newMigration);
      navigate(`/migration/${correlationId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit migration';
      setError(`API Error: ${errorMessage}`);
      if (errorMessage.includes('400')) {
        setApiErrorDetails(`
          Possible causes:
          • Invalid file format for ${selectedTool}
          • Malformed configuration content
          • Missing required fields in the configuration
          • Agent ID may be incorrect or unavailable
        `);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const toolConfig = TOOL_CONFIGS[selectedTool] as ToolConfig;

  return (
    <div className="migration-form">
      <h2 className="form-title">New Migration</h2>

      {!api.isAuthenticated && (
        <div className="auth-warning">
          ⚠️ You are not authenticated. Please check your API token.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-card">
            <div className="form-group">
              <label htmlFor="tool-select">Select Tool</label>
              <select
                id="tool-select"
                value={selectedTool}
                onChange={handleToolChange}
                className="tool-select"
              >
                {Object.keys(TOOL_CONFIGS).map(tool => (
                  <option key={tool} value={tool}>
                    {tool}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-card">
            <div className="form-group">
              <label>Upload Configuration File</label>
              <div className="file-upload-container">
                <button type="button" className="upload-button" onClick={handleUploadClick}>
                  <FaUpload className="upload-icon" />
                  Select File
                </button>
                <span className="file-name">
                  {fileName || `No file selected (${toolConfig.accept})`}
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept={toolConfig.accept}
                  onChange={handleFileChange}
                  className="file-input"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-card">
          <div className="form-group">
            <label htmlFor="file-content">Or Paste Configuration</label>
            <textarea
              id="file-content"
              value={fileContent}
              onChange={handleTextAreaChange}
              placeholder={`Paste your ${selectedTool} configuration here...`}
              rows={10}
              className="file-content"
            />
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            {apiErrorDetails && <div className="error-details">{apiErrorDetails}</div>}
          </div>
        )}

        <button
          type="submit"
          className="submit-button"
          disabled={isLoading || !fileContent.trim()}
        >
          {isLoading ? (
            <>
              <FaSpinner className="spinner" />
              Processing...
            </>
          ) : (
            'Submit Migration'
          )}
        </button>
      </form>
    </div>
  );
};

export default MigrationForm;
