
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { useMigration } from '../../context/MigrationContext';
import { useEventPolling } from '../../hooks/useEventPolling';
import { useApi } from '../../services/api';
import EventList from '../EventList/EventList';
import Loading from '../common/Loading/Loading';
import Error from '../common/Error/Error';
import { formatTimestamp } from '../../utils';
import './MigrationDetail.css';
import YamlViewer from '../YamlViewer/YamlViewer';

const MigrationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMigrationById, setSelectedMigration } = useMigration();
  const { events, isPolling, error: pollingError, yaml, isCompleted } = useEventPolling(id || null);
  const api = useApi();

  // MOdify this to use your Harness API token
  const HARNESS_API_TOKEN = "pat.hfPfGpq7RZORzBmgaaQkOw.68a2f0cc81c02801a7fd63f9.E8OKTUQtbNKvbmHXTzLH";

  const [pipelineUrl, setPipelineUrl] = useState<string | null>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [isCreatingPipeline, setIsCreatingPipeline] = useState(false);

  const migration = getMigrationById(id || '');

  useEffect(() => {
    if (migration) {
      setSelectedMigration(migration);
    }
    return () => setSelectedMigration(null);
  }, [migration, setSelectedMigration]);

  const handleBackClick = () => navigate('/');

/* const testYaml = `
pipeline:
  name: Test Pipeline
  identifier: test_pipeline
  description: Pipeline for testing purposes
  projectIdentifier: psproject01
  orgIdentifier: ps01
  accountId: hfPfGpq7RZORzBmgaaQkOw
  stages:
    - stage:
        name: Build
        identifier: build_stage
        type: Custom
        spec:
          failureStrategies:
            - onFailure:
                errors:
                  - AllErrors
                action:
                  type: Ignore
          execution:
            steps:
              - step:
                  name: Build Step
                  identifier: build_step
                  type: ShellScript
                  spec:
                    shell: Bash
                    onDelegate: true
                    source:
                      type: Inline
                      spec:
                        script: |
                          echo "Running build"
                          echo "Build complete"

    - stage:
        name: Deploy
        identifier: deploy_stage
        type: Custom
        spec:
          failureStrategies:
            - onFailure:
                errors:
                  - AllErrors
                action:
                  type: Ignore
          execution:
            steps:
              - step:
                  name: Deploy Step
                  identifier: deploy_step
                  type: ShellScript
                  spec:
                    shell: Bash
                    onDelegate: true
                    source:
                      type: Inline
                      spec:
                        script: |
                          echo "Deploying application"
                          echo "Deploy complete"

`; */

  const handleCreatePipeline = async () => {
    console.log("Received harness API token");
    if (!yaml) return;
    if (!migration) return;
    if (!HARNESS_API_TOKEN) {
      setPipelineError('You must provide a valid Harness API token.');
      return;
    }

    setIsCreatingPipeline(true);
    setPipelineError(null);

    try {
      const accountId = 'hfPfGpq7RZORzBmgaaQkOw';
      const orgId = 'ps01';    
      const projectId = 'psproject01'; 
      console.log("Creating pipeline with YAML:", yaml);// modify here for testYaml for testing
      const pipelineId = await api.createHarnessPipeline({
        token: HARNESS_API_TOKEN,
        accountId,
        orgIdentifier: orgId,
        projectIdentifier: projectId,
        pipelineYaml: yaml,// modify here to with testyaml
      });

      const url = `https://app.harness.io/ng/account/${accountId}/cd/orgs/${orgId}/projects/${projectId}/pipelines/${pipelineId}/pipeline-studio`;
      setPipelineUrl(url);
    } catch (error: any) {
      setPipelineError(error.message || 'Failed to create pipeline.');
    } finally {
      setIsCreatingPipeline(false);
    }
  };

  if (!migration) {
    return (
      <div className="migration-detail">
        <Error message="Migration not found" onRetry={handleBackClick} />
      </div>
    );
  }

  if (!api.isAuthenticated) {
    return (
      <div className="migration-detail">
        <div className="auth-warning">
          ⚠️ You are not authenticated. Please set a valid API token to view migration details.
        </div>
        <button className="back-button" onClick={handleBackClick}>
          <FaArrowLeft /> Back to Home
        </button>
      </div>
    );
  }

  if (pollingError) {
    return (
      <div className="migration-detail">
        <Error message={pollingError} onRetry={handleBackClick} />
      </div>
    );
  }
  const mappedEvents = events.map(e => ({
    timestamp: new Date(e.timestamp).toISOString(),
    correlationId: e.correlationId,
    message: e.message,
    status: e.agentStatus || 'pending',
    agentId: e.agentId || '',
    tool: e.tool,
    toolId: e.toolId,
    toolInput: e.toolInput,
    toolOutput: e.toolOutput,
    dockerInput: e.dockerInput,
    input: e.input,
    output: e.output,
  }));

  return (
    <div className="migration-detail">
      <div className="detail-header">
        <h2>{migration.name}</h2>
        <div className="migration-meta">
          {migration.tool && migration.tool !== 'Unknown' && (
            <span className="migration-tool">{migration.tool}</span>
          )}
          <span className="migration-time">{formatTimestamp(migration.timestamp)}</span>
          <span className={`migration-status status-${isCompleted ? 'completed' : migration.status}`}>
            {isCompleted ? 'completed' : migration.status}
            {(isPolling && !isCompleted) && <FaSpinner className="spinner" />}
          </span>
        </div>
      </div>

      {isPolling && events.length === 0 && (
        <Loading message="Fetching migration data..." />
      )}

      <div className="detail-content">


        {yaml && (
            <div className="yaml-section">
              <h3>Generated YAML from Agent</h3>
              <YamlViewer yaml={yaml} />
            </div>
          )}

        {pipelineUrl ? (
          <div className="pipeline-link">
            <h3>Harness Pipeline</h3>
            <a href={pipelineUrl} target="_blank" rel="noopener noreferrer">{pipelineUrl}</a>
          </div>
        ) : (
          <>
            {yaml && (
              <>
                <button
                  onClick={handleCreatePipeline}
                  className="create-pipeline-btn"
                  disabled={isCreatingPipeline}
                >
                  {isCreatingPipeline ? (
                    <>
                      Creating Pipeline... <FaSpinner className="spinner" />
                    </>
                  ) : (
                    'Create Pipeline in Harness'
                  )}
                </button>
              </>
            )}
            {pipelineError && <Error message={pipelineError} onRetry={handleCreatePipeline} />}
          </>
        )}

        <EventList events={mappedEvents} />
      </div>
    </div>
    
  );
};

export default MigrationDetail;
