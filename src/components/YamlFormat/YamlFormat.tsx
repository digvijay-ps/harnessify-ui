import React, { useState } from 'react';
import { FaCopy, FaCheck, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import yaml from 'js-yaml';
import './YamlFormat.css';

interface PipelineYamlViewerProps {
  yamlString: string;
}

interface Stage {
  name: string;
  content: string;
}

const PipelineYamlViewer: React.FC<PipelineYamlViewerProps> = ({ yamlString }) => {
  const [copiedStage, setCopiedStage] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({});

  // Parse YAML and extract stages
  let stages: Stage[] = [];
  try {
    const parsed = yaml.load(yamlString) as any;
    if (parsed?.pipeline?.stages) {
      stages = parsed.pipeline.stages.map((s: any) => {
      const stageKey = Object.keys(s)[0];  // "stage"
      const stageContent = s[stageKey];

      // For agent YAML, the stage name is the value itself if it's a string
      const name = typeof stageContent === 'string' ? stageContent : stageContent.name || stageKey;

      return {
        name,
        content: yaml.dump(s, { lineWidth: -1, styles: { '!!str': '|' } }),
      };
    });
    }
  } catch (e) {
    stages = [{ name: 'Error', content: 'Failed to parse YAML' }];
  }

  // Copy a single stage
  const handleCopyStage = (content: string, stageName: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedStage(stageName);
      setTimeout(() => setCopiedStage(null), 2000);
    });
  };

  // Copy all stages
  const handleCopyAll = () => {
    const allContent = stages.map(s => s.content).join('\n---\n');
    navigator.clipboard.writeText(allContent).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  };

  const toggleStage = (stageName: string) => {
    setExpandedStages(prev => ({
      ...prev,
      [stageName]: !prev[stageName],
    }));
  };

  return (
    <div className="pipeline-yaml-viewer">
      <div className="toolbar">
        <button className="copy-all-button" onClick={handleCopyAll}>
          {copiedAll ? <><FaCheck /> Copied All!</> : <><FaCopy /> Copy All</>}
        </button>
      </div>

      {stages.map(stage => (
        <div key={stage.name} className="stage-container">
          <div className="stage-header" onClick={() => toggleStage(stage.name)}>
            <button className="toggle-button" >
              {expandedStages[stage.name] ? <FaChevronDown /> : <FaChevronRight />}
            </button>
            <span className="stage-title">{stage.name}</span>
            <button
              className="copy-button"
              onClick={() => handleCopyStage(stage.content, stage.name)}
            >
              {copiedStage === stage.name ? <><FaCheck /> Copied!</> : <><FaCopy /> Copy</>}
            </button>
          </div>
          {expandedStages[stage.name] && (
            <pre className="stage-content">
              <code>{stage.content}</code>
            </pre>
          )}
        </div>
      ))}
    </div>
  );
};

export default PipelineYamlViewer;
