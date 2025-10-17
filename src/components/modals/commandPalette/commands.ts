import type { FocusMode, Workspace } from '../../../types';
import type { Command } from './types';
import type { ApiUser } from '../../../api/types';
import { getActions } from '../../../global';
import { EVERYTHING_WORKSPACE_ID } from '../../../global/selectors/workspaces';
import { createElement, TeactNode } from '../../../lib/teact/teact';
import WorkspaceAvatar from '../../left/main/WorkspaceAvatar';

export function getAvailableCommands(allWorkspaces: Workspace[], currentWorkspaceId: string, currentUser?: ApiUser, focusMode?: FocusMode): Command[] {
  const { setFocusMode, setCurrentWorkspace } = getActions();

  const focusModeCommands: Command[] = [];

  if (!focusMode) {
    focusModeCommands.push({
      id: 'enable-focus-no-distraction',
      title: 'Focus: No Distraction',
      subtitle: 'Hide muted chat badges and online status',
      icon: 'eye-crossed',
      keywords: ['enable', 'nodistraction'],
      action: () => {
        setFocusMode({ mode: 'noDistraction' });
      },
    });

    focusModeCommands.push({
      id: 'enable-focus-deep-work',
      title: 'Focus: Deep Work',
      subtitle: 'Hide all chat badges and online status',
      icon: 'mute',
      keywords: ['enable', 'deepwork'],
      action: () => {
        setFocusMode({ mode: 'deepWork' });
      },
    });
  } else {
    focusModeCommands.push({
      id: 'disable-focus-mode',
      title: 'Disable Focus Mode',
      subtitle: `Currently: ${focusMode === 'noDistraction' ? 'No Distraction' : 'Deep Work'}`,
      icon: 'unmute',
      keywords: ['turn off', 'exit'],
      action: () => {
        setFocusMode({ mode: undefined });
      },
    });

    const otherMode = focusMode === 'noDistraction' ? 'deepWork' : 'noDistraction';
    const otherModeTitle = otherMode === 'noDistraction' ? 'No Distraction' : 'Deep Work';

    focusModeCommands.push({
      id: `switch-focus-${otherMode}`,
      title: `Switch to ${otherModeTitle}`,
      subtitle: `Currently: ${focusMode === 'noDistraction' ? 'No Distraction' : 'Deep Work'}`,
      icon: 'replace',
      keywords: ['focus', otherModeTitle.toLowerCase(), otherMode.toLowerCase()],
      action: () => {
        setFocusMode({ mode: otherMode });
      },
    });
  }

  const commands: Command[] = [];

  if (focusModeCommands.length > 0) {
    commands.push(...focusModeCommands);
  }

  if (allWorkspaces.length > 1) {
    commands.push(...allWorkspaces.filter((workspace) => workspace.id !== currentWorkspaceId).map((workspace) => ({
      id: `switch-workspace-${workspace.id}`,
      title: `Switch to ${workspace.name}`,
      avatar: createElement(WorkspaceAvatar, {
        workspace,
        currentUser,
        size: 'tiny',
        isRectangular: false,
      }) as unknown as TeactNode,
      keywords: ['workspace', workspace.name.toLowerCase(), ...(workspace.id === EVERYTHING_WORKSPACE_ID ? ['default'] : [])],
      action: () => {
        setCurrentWorkspace({ workspaceId: workspace.id });
      },
    })));
  }

  return commands;
}

export function searchCommands(commands: Command[], query: string): Command[] {
  if (!query) {
    return commands;
  }

  const lowerQuery = query.toLowerCase().trim();
  const results: Command[] = [];

  commands.forEach((command) => {
    const titleMatch = command.title.toLowerCase().includes(lowerQuery);
    const keywordsMatch = command.keywords?.some((keyword) => keyword.toLowerCase().includes(lowerQuery));

    if (titleMatch || keywordsMatch) {
      results.push(command);
    }
  });

  return results;
}
