import type { GlobalState } from '../types';
import type { Workspace } from '../../types';

import { getAdjustedUnreadCounters } from '../../util/folderManager';
import { SAVED_FOLDER_ID } from '../../config';

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

export function selectWorkspaceUnreadUnmutedChatsCount(
  workspace: Workspace,
  allWorkspaces: Workspace[],
  excludeOtherWorkspaces: boolean,
): number {
  const adjustedUnreadCounters = getAdjustedUnreadCounters(excludeOtherWorkspaces, allWorkspaces);

  if (workspace.id === EVERYTHING_WORKSPACE_ID) {
    const otherWorkspacesFoldersIds = allWorkspaces.flatMap(w => w.foldersIds);
    otherWorkspacesFoldersIds.push(SAVED_FOLDER_ID);

    return Object.entries(adjustedUnreadCounters)
      .filter(([folderId]) => !otherWorkspacesFoldersIds.includes(Number(folderId)))
      .reduce((acc, [, counters]) => acc + (counters?.unmutedChatsCount || 0), 0);
  }

  let count = 0;

  for (const folderId of workspace.foldersIds) {
    const folderCounters = adjustedUnreadCounters[folderId];
    if (folderCounters) {
      count += folderCounters.unmutedChatsCount;
    }
  }

  return count;
}