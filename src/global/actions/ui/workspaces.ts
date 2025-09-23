import type { ActionReturnType, GlobalState } from '../../types';

import { addActionHandler, setGlobal } from '../..';

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