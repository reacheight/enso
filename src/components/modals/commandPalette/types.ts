import type { IconName } from '../../../types/icons';

export type CommandAction = () => void;

export interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon?: IconName;
  action: CommandAction;
  keywords?: string[];
}

export interface CommandCategory {
  id: string;
  title: string;
  commands: Command[];
}

