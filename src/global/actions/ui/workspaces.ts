import type { ActionReturnType, GlobalState } from '../../types';
import type { Workspace } from '../../../types';

import { addActionHandler, setGlobal } from '../..';
import { unique } from '../../../util/iteratees';
import { EVERYTHING_WORKSPACE_ID } from '../../selectors/workspaces';

type UpdateWorkspaceSettingsPayload = Partial<GlobalState['workspaces']>;

function updateWorkspaceSettings<T extends GlobalState>(
  global: T, payload: UpdateWorkspaceSettingsPayload,
) {
  global = {
    ...global,
    workspaces: {
      ...global.workspaces,
      ...payload,
    },
  };
  setGlobal(global);
  return global;
}

addActionHandler('openWorkspaceCreator', (global): ActionReturnType => {
  updateWorkspaceSettings(global, { isCreatorOpen: true, editingWorkspaceId: undefined });
});

addActionHandler('openWorkspaceEditor', (global, actions, payload?: { workspaceId: string }): ActionReturnType => {
  updateWorkspaceSettings(global, { isCreatorOpen: true, editingWorkspaceId: payload?.workspaceId });
});

addActionHandler('closeWorkspaceCreator', (global): ActionReturnType => {
  updateWorkspaceSettings(global, { isCreatorOpen: false, editingWorkspaceId: undefined });
});

addActionHandler('createWorkspace', (global, actions, payload): ActionReturnType => {
  const { workspace } = payload;
  
  global = {
    ...global,
    workspaces: {
      ...global.workspaces,
      byId: {
        ...global.workspaces.byId,
        [workspace.id]: workspace,
      },
      orderedIds: unique([...global.workspaces.orderedIds, workspace.id]),
    },
  };
  
  setGlobal(global);
});

addActionHandler('updateWorkspace', (global, actions, payload): ActionReturnType => {
  const { workspace } = payload;
  
  if (!global.workspaces.byId[workspace.id]) {
    return;
  }
  
  global = {
    ...global,
    workspaces: {
      ...global.workspaces,
      byId: {
        ...global.workspaces.byId,
        [workspace.id]: workspace,
      },
    },
  };
  
  setGlobal(global);
});

addActionHandler('deleteWorkspace', (global, actions, payload): ActionReturnType => {
  const { workspaceId } = payload;
  
  if (!global.workspaces.byId[workspaceId]) {
    return;
  }
  
  const { [workspaceId]: deleted, ...restById } = global.workspaces.byId;
  const orderedIds = global.workspaces.orderedIds.filter((id) => id !== workspaceId);
  
  global = {
    ...global,
    workspaces: {
      ...global.workspaces,
      byId: restById,
      orderedIds,
      currentWorkspaceId: global.workspaces.currentWorkspaceId === workspaceId 
        ? EVERYTHING_WORKSPACE_ID 
        : global.workspaces.currentWorkspaceId,
    },
  };
  
  setGlobal(global);
});

addActionHandler('setCurrentWorkspace', (global, actions, payload): ActionReturnType => {
  const { workspaceId } = payload;
  
  global = {
    ...global,
    workspaces: {
      ...global.workspaces,
      currentWorkspaceId: workspaceId,
    },
  };
  
  setGlobal(global);
});

addActionHandler('setExcludeOtherWorkspaces', (global, actions, payload): ActionReturnType => {
  const { excludeOtherWorkspaces } = payload;
  
  global = {
    ...global,
    workspaces: {
      ...global.workspaces,
      excludeOtherWorkspaces,
    },
  };
  
  setGlobal(global);
});