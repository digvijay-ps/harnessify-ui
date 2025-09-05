import { ToolConfigs } from '../types';

// Tool configurations
export const TOOL_CONFIGS: ToolConfigs = {
  'Spinnaker': {
    agentId: '68a3092193ef9dab0c0754b6',
    key: 'jsonFile',
    accept: '.json',
    name: 'Spinnaker'
  },
  'Jenkins': {
    agentId: '68b93f86bc6dfa5ea693cece',
    key: 'jenkinsFile',
    accept: '.groovy, .jenkinsfile',
    name: 'Jenkins'
  },
  'AzureDevops': {
    agentId: 'azure-to-harness',
    key: 'yaml',
    accept: '.yml, .yaml',
    name: 'Azure Devops'
  },
  'UrbanCode': {
    agentId: 'urbancode-to-harness',
    key: 'yaml',
    accept: '.yml, .yaml',
    name: 'UrbanCode'
  },
};

// Format timestamp to readable date
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

// Read file as text
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};
