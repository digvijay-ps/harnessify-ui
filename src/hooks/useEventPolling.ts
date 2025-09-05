import { useEffect, useRef, useState } from 'react';
import { useApi } from '../services/api';
import { EventResponse } from '../types';
import { useMigration } from '../context/MigrationContext';
import { Migration } from '../types';

export const useEventPolling = (correlationId: string | null) => {
  const api = useApi();
  const { addMigration, getMigrationById } = useMigration();
 // ✅ Used to update status in sidebar
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [yaml, setYaml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const pollingRef = useRef<number | null>(null);
  const stoppedRef = useRef(false);
  const retryCount = useRef(0);

  useEffect(() => {
    if (!correlationId || !api.isAuthenticated || stoppedRef.current) {
      return;
    }

    const poll = async () => {
      setIsPolling(true);
      try {
        const data = await api.fetchEvents(correlationId);
        setEvents(prev => {
          const newEvents = data.filter(
            e => !prev.some(pe => pe.correlationId === e.correlationId && pe.timestamp === e.timestamp)
          );
          return [...prev, ...newEvents];
        });

        const completed = data.some(event =>
          event.agentStatus === 'completed' ||
          event.event_type === 'MIGRATION_COMPLETED' || 
          event.event_type === 'MIGRATION_FAILED'
        );

        if (completed) {
          setIsCompleted(true);

          // ✅ Update migration status globally
          const latestEvent = data.find(e =>
            e.agentStatus === 'completed' || e.event_type === 'MIGRATION_COMPLETED'
          );
          if (latestEvent && latestEvent.correlationId) {
  const existing: Migration | undefined = getMigrationById(latestEvent.correlationId);

  addMigration({
    id: latestEvent.correlationId,
    correlationId: latestEvent.correlationId,
    name: existing?.name || '',
    tool: existing?.tool || '',
    timestamp: latestEvent.timestamp,
    status: 'completed',
    yaml: existing?.yaml,
  });
}


          // ✅ Try output.yaml first
          const yamlEvent = data.find(e =>
            e.agentStatus === 'completed' && e.output?.yaml
          );
          if (yamlEvent?.output?.yaml) {
            setYaml(yamlEvent.output.yaml);
          }

          if (pollingRef.current !== null) {
            clearTimeout(pollingRef.current);
          }

          setIsPolling(false);
          return;
        }

        pollingRef.current = window.setTimeout(poll, 3000);
        retryCount.current = 0; // reset on success
      } catch (err: any) {
        const rawMessage = err?.message || 'Unknown error';

        let displayMessage = 'An error occurred while polling for events.';
        if (rawMessage.includes('401')) {
          displayMessage = 'Authentication failed (401). Please log in again.';
        } else if (rawMessage.includes('403')) {
          displayMessage = 'You do not have permission to view this migration (403).';
        } else if (rawMessage.toLowerCase().includes('unauthorized')) {
          displayMessage = 'Unauthorized access. Please check your token.';
        } else if (rawMessage.toLowerCase().includes('unauthenticated')) {
          displayMessage = 'You are not authenticated. Please log in.';
        } else {
          displayMessage = `Unexpected error: ${rawMessage}`;
        }

        setError(displayMessage);

        if (
          rawMessage.includes('401') ||
          rawMessage.includes('403') ||
          rawMessage.toLowerCase().includes('unauthorized') ||
          rawMessage.toLowerCase().includes('unauthenticated')
        ) {
          stoppedRef.current = true;
          if (pollingRef.current !== null) {
            clearTimeout(pollingRef.current);
          }
        } else {
          if (retryCount.current < 2) {
            retryCount.current += 1;
            pollingRef.current = window.setTimeout(poll, 6000);
          } else {
            stoppedRef.current = true;
            if (pollingRef.current !== null) {
              clearTimeout(pollingRef.current);
            }
          }
        }

        setIsPolling(false);
      }
    };

    poll();

    return () => {
      if (pollingRef.current !== null) {
        clearTimeout(pollingRef.current);
      }
    };
  }, [correlationId, api.isAuthenticated]);

  return { events, isPolling, error, yaml, isCompleted };
};
