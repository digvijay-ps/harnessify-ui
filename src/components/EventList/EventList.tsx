import React, { useState } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import PipelineYamlViewer from '../YamlFormat/YamlFormat';
import './EventList.css';

interface Event {
  timestamp: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  agentId: string;
  correlationId: string;
  message: string;
  tool?: string;
  toolId?: string;
  toolInput?: any;
  toolOutput?: any;
  dockerInput?: any;
  input?: any;
  output?: { yaml?: string };
}

interface EventListProps {
  events: Event[];
  title?: string;
}

const EventList: React.FC<EventListProps> = ({ events, title = 'Execution Events' }) => {
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  const toggleEvent = (correlationId: string) => {
    setExpandedEvents(prev => ({
      ...prev,
      [correlationId]: !prev[correlationId],
    }));
  };

  if (events.length === 0) return null;

  // Compute summary counts
  const summary = events.reduce(
    (acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

   

  return (
    <div className="event-list-container">
      <h3 className="event-list-title">{title}</h3>
      <div className="event-list">
        {events.map(event => (
          <div key={event.correlationId + event.timestamp} className={`event-item ${event.status}`}>
            <div className="event-header" onClick={() => toggleEvent(event.correlationId)}>
              <div className="event-left">
                <span className="event-timestamp">{new Date(event.timestamp).toLocaleString()}</span>
                <span className={`event-status status-${event.status}`}>{event.status}</span>
              </div>
              <div className="event-message">{event.message}</div>
              <div className="event-actions">
                <button className="toggle-button">
                  {expandedEvents[event.correlationId] ? <FaChevronDown /> : <FaChevronRight />}
                </button>
              </div>
            </div>

            {/* Expanded details for ALL events */}
            {expandedEvents[event.correlationId] && (
              <div className="event-details">
                <div><strong>Agent ID:</strong> {event.agentId}</div>
                <div><strong>Correlation ID:</strong> {event.correlationId}</div>
                {event.tool && <div><strong>Tool:</strong> {event.tool}</div>}
                {event.toolId && <div><strong>Tool ID:</strong> {event.toolId}</div>}

                {event.toolInput && (
                  <div>
                    <strong>Tool Input:</strong>
                    <pre>{JSON.stringify(event.toolInput, null, 2)}</pre>
                  </div>
                )}

                {event.toolOutput && (
                  <div>
                    <strong>Tool Output:</strong>
                    <pre>{JSON.stringify(event.toolOutput, null, 2)}</pre>
                  </div>
                )}

                {event.dockerInput && (
                  <div>
                    <strong>Docker Input:</strong>
                    <pre>{JSON.stringify(event.dockerInput, null, 2)}</pre>
                  </div>
                )}

                {event.input && (
                  <div>
                    <strong>Input:</strong>
                    <pre>{JSON.stringify(event.input, null, 2)}</pre>
                  </div>
                )}

                {event.output?.yaml && (
                  <div className="event-yaml mt-2">
                    <PipelineYamlViewer yamlString={event.output.yaml} />
                    
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary section */}
      <div className="event-summary mt-4 p-3 border rounded bg-gray-50">
        <h4 className="font-semibold mb-2">Summary</h4>
        <div>Pending: {summary['pending'] || 0}</div>
        <div>In Progress: {summary['in-progress'] || 0}</div>
        <div>Completed: {summary['completed'] || 0}</div>
        <div>Failed: {summary['failed'] || 0}</div>
        <div>Total: {events.length}</div>
      </div>
    </div>
  );
};

export default EventList;
