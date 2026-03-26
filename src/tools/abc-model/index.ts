import type { ToolDefinition } from '../../core/types/tool';
import { migration001 } from './migrations/001-create-abc-entries';

export const abcModelTool: ToolDefinition = {
  id: 'abc-model',
  name: 'Model ABC',
  description: 'Zrozum powiązania między sytuacją, myślami i konsekwencjami',
  icon: 'git-network-outline',
  routePrefix: '/abc-model',
  migrations: [migration001],
  enabled: true,
  version: '0.1.0',
};
