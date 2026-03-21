import type { ToolDefinition } from '../../core/types/tool';
import { migration001 } from './migrations/001-create-behavioral-experiments';

export const behavioralExperimentTool: ToolDefinition = {
  id: 'behavioral-experiment',
  name: 'Eksperyment Behawioralny',
  description: 'Testuj swoje przekonania przez działanie',
  icon: 'flask',
  routePrefix: '/behavioral-experiment',
  migrations: [migration001],
  enabled: true,
  version: '0.1.0',
};
