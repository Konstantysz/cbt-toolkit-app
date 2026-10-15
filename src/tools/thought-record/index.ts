import type { ToolDefinition } from '../../core/types/tool';
import { pl } from './i18n/pl';
import { migration001 } from './migrations/001-create-thought-records';
import { migration002 } from './migrations/002-add-is-example-flag';

export const thoughtRecordTool: ToolDefinition = {
  id: 'thought-record',
  name: pl.toolName,
  description: pl.toolDescription,
  icon: 'journal-outline',
  routePrefix: '/thought-record',
  migrations: [migration001, migration002],
  enabled: true,
  version: '0.1.0',
};
