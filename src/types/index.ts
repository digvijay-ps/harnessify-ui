// API Response Types
export interface ApiResponse {
  data: {
    correlation_id: string;
    [key: string]: any;
  };
}

export interface EventResponse {
  id: string;
  correlationId: string;
  timestamp: number;
  message: string;
  agentStatus: 'pending' | 'in-progress' | 'completed' | 'failed';
  tool?: string;
  toolOutput?: string;
  [key: string]: any;
}

// Migration Types
export interface Migration {
  id: string;
  correlationId: string;
  name: string;
  tool: string;
  timestamp: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  yaml?: string;
}
export type MigrationStatus = 'pending' | 'in-progress' | 'completed' | 'failed';
// Tool Configuration Types
export interface ToolConfig {
  agentId: string;
  key: string;
  accept: string;
  name: string;
}

export interface ToolConfigs {
  [key: string]: ToolConfig;
}
