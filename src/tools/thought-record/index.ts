import type { ToolDefinition } from '../../core/types/tool';
import { migration001 } from './migrations/001-create-thought-records';
import { migration002 } from './migrations/002-add-is-example-flag';

export const thoughtRecordTool: ToolDefinition = {
  id: 'thought-record',
  name: 'Zapis Myśli',
  description: 'Zapisuj i analizuj swoje myśli automatyczne',
  icon: 'journal-outline',
  routePrefix: '/thought-record',
  migrations: [migration001, migration002],
  enabled: true,
  version: '0.1.0',
};
