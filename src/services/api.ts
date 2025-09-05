import { useAuth } from '../context/AuthContext';

import { ApiResponse, EventResponse } from '../types';

const API_BASE_URL = '/api';

interface CreatePipelineParams {
  token: string;
  accountId: string;
  orgIdentifier: string;
  projectIdentifier: string;
  pipelineYaml: string;
}

/**
 * Custom hook that returns API methods with authentication
 */
export const useApi = () => {
  const { headers } = useAuth(); 

  // Check if we have a valid token (based on main auth headers)
  const isAuthenticated = Boolean(
    headers?.Authorization &&
    headers.Authorization.startsWith('Bearer ') &&
    headers.Authorization.length > 10
  );

  /**
   * Create a new Harness pipeline
   */
  const createHarnessPipeline = async ({
  token,
  accountId,
  orgIdentifier,
  projectIdentifier,
  pipelineYaml,
}: CreatePipelineParams): Promise<string> => {

  // const response = await fetch("http://localhost:5000/api/pipelines", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     token,
  //     accountId,
  //     orgIdentifier,
  //     projectIdentifier,
  //     pipelineYaml,
  //   }),
  // });
  
  const url = `/api/harness/pipeline/api/pipelines/v2?accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/yaml",
      "x-api-key": token,  // this will be forwarded by Nginx
    },
    body: pipelineYaml,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create pipeline: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.data?.identifier || data.data?.pipeline?.identifier;
};

  /**
   * Make an authenticated API request with enhanced error handling
   */
  const fetchWithAuth = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    if (!isAuthenticated) {
      throw new Error('Unauthenticated');
    }

    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        ...headers,
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(url, requestOptions);

      if (response.status === 401) {
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        let errorData;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
          } else {
            errorData = await response.text();
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }

        console.error(`API error: ${response.status}`, errorData);
        throw new Error(`API error: ${response.status} - ${errorData?.message || response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json() as T;
      } else {
        return await response.text() as unknown as T;
      }
    } catch (error) {
      console.error(`API request failed:`, error);
      throw error;
    }
  };

  /**
   * Submit a migration with fixed request format
   */
  const submitMigration = async (
    agentId: string,
    fileKey: string,
    fileContent: string
  ): Promise<string> => {
    const requestBody = {
      input_params: {
        [fileKey]: fileContent,
        use_docker_agent: true,
      },
    };

    try {
      console.log(`Submitting migration with agent ID: ${agentId}`);

      const data = await fetchWithAuth<ApiResponse>(`/agents/${agentId}/query`, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!data.data || !data.data.correlation_id) {
        throw new Error('Invalid response: missing correlation_id');
      }

      return data.data.correlation_id;
    } catch (error) {
      console.error(`Failed to submit migration with agent ID: ${agentId}, file key: ${fileKey}`);
      throw error;
    }
  };

  /**
   * Fetch events for a migration
   */
  const fetchEvents = async (correlationId: string): Promise<EventResponse[]> => {
    return await fetchWithAuth<EventResponse[]>(`/events/events?correlationId=${correlationId}`);
  };

  return {
    isAuthenticated,
    submitMigration,
    fetchEvents,
    fetchWithAuth,
    createHarnessPipeline,
  };
};
