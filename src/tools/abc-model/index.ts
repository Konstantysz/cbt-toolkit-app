import type { ToolDefinition } from '../../core/types/tool';
import { pl } from './i18n/pl';
import { migration001 } from './migrations/001-create-abc-entries';

export const abcModelTool: ToolDefinition = {
  id: 'abc-model',
  name: pl.toolName,
  description: pl.toolDescription,
  icon: 'git-network-outline',
  routePrefix: '/abc-model',
  migrations: [migration001],
  enabled: true,
  version: '0.1.0',
};
