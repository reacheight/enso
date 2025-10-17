import type { IconName } from '../../../types/icons';
import type { TeactNode } from '../../../lib/teact/teact';

export type CommandAction = () => void;

export interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon?: IconName;
  avatar?: TeactNode;
  action: CommandAction;
  keywords?: string[];
}
