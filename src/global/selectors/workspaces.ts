import type { GlobalState } from '../types';
import type { Workspace } from '../../types';

import { getOrderedIds } from '../../util/folderManager';
import { getIsChatMuted } from '../helpers/notifications';
import { selectChat } from './chats';
import { selectNotifyDefaults, selectNotifyException } from './settings';

export const EVERYTHING_WORKSPACE_ID = '0';

export const EVERYTHING_WORKSPACE: Workspace = {
  id: EVERYTHING_WORKSPACE_ID,
  name: 'Personal',
  foldersIds: [],
};

export function selectIsWorkspaceCreatorOpen<T extends GlobalState>(global: T) {
  return global.workspaces.isCreatorOpen;
}

export function selectEditingWorkspaceId<T extends GlobalState>(global: T) {
  return global.workspaces.editingWorkspaceId;
}

export function selectWorkspaces<T extends GlobalState>(global: T): Workspace[] {
  const { byId, orderedIds } = global.workspaces;
  const userWorkspaces = orderedIds.map((id) => byId[id]).filter(Boolean);

  return [EVERYTHING_WORKSPACE, ...userWorkspaces];
}

export function selectWorkspaceById<T extends GlobalState>(global: T, workspaceId: string): Workspace | undefined {
  return global.workspaces.byId[workspaceId] || EVERYTHING_WORKSPACE;
}

export function selectCurrentWorkspaceId<T extends GlobalState>(global: T) {
  return global.workspaces.currentWorkspaceId;
}

export function selectCurrentWorkspace<T extends GlobalState>(global: T): Workspace {
  const currentId = global.workspaces.currentWorkspaceId;
  return global.workspaces.byId[currentId] || EVERYTHING_WORKSPACE;
}

export function selectExcludeOtherWorkspaces<T extends GlobalState>(global: T) {
  return global.workspaces.excludeOtherWorkspaces;
}

export function selectWorkspaceUnreadUnmutedChatsCount<T extends GlobalState>(
  global: T,
  workspace: Workspace,
): number {
  if (workspace.id === EVERYTHING_WORKSPACE_ID) {
    return 0;
  }

  const notifyDefaults = selectNotifyDefaults(global);
  let count = 0;

  for (const folderId of workspace.foldersIds) {
    const orderedIds = getOrderedIds(folderId);
    if (!orderedIds) continue;

    for (const chatId of orderedIds) {
      const chat = selectChat(global, chatId);
      if (!chat) continue;

      const hasUnread = Boolean(
        chat.unreadCount
        || chat.unreadMentionsCount
        || chat.hasUnreadMark,
      );

      if (!hasUnread) continue;

      const isMuted = getIsChatMuted(chat, notifyDefaults, selectNotifyException(global, chatId));
      if (!isMuted) {
        count++;
      }
    }
  }

  return count;
}