import type { ToolDefinition, Migration } from '../core/types/tool';
import { thoughtRecordTool } from './thought-record';
import { behavioralExperimentTool } from './behavioral-experiment';
import { abcModelTool } from './abc-model';

const ALL_TOOLS: ToolDefinition[] = [thoughtRecordTool, behavioralExperimentTool, abcModelTool];

export function getEnabledTools(): ToolDefinition[] {
  return ALL_TOOLS.filter((tool) => tool.enabled);
}

export function getAllMigrations(): Migration[] {
  return ALL_TOOLS.flatMap((tool) => tool.migrations);
}
