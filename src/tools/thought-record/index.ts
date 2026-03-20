import type { ToolDefinition } from '../../core/types/tool';
import { migration001 } from './migrations/001-create-thought-records';

export const thoughtRecordTool: ToolDefinition = {
  id: 'thought-record',
  name: 'Zapis Myśli',
  description: 'Zapisuj i analizuj swoje myśli automatyczne',
  icon: 'brain',
  routePrefix: '/thought-record',
  migrations: [migration001],
  enabled: true,
  version: '0.1.0',
};
