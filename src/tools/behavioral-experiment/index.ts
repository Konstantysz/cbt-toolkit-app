import type { ToolDefinition } from '../../core/types/tool';
import { migration001 } from './migrations/001-create-behavioral-experiments';
import { migration002 } from './migrations/002-recreate-behavioral-experiments';

export const behavioralExperimentTool: ToolDefinition = {
  id: 'behavioral-experiment',
  name: 'Eksperyment Behawioralny',
  description: 'Testuj swoje przekonania przez działanie',
  icon: 'flask',
  routePrefix: '/behavioral-experiment',
  migrations: [migration001, migration002],
  enabled: true,
  version: '0.2.0',
};
