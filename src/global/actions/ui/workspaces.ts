import type { ActionReturnType, GlobalState } from '../../types';

import { addActionHandler, setGlobal } from '../..';

type UpdateWorkspaceSettingsPayload = Partial<GlobalState['workspaces']>;

function updateWorkspaceSettings<T extends GlobalState>(
  global: T, { isCreatorOpen }: UpdateWorkspaceSettingsPayload,
) {
  global = {
    ...global,
    workspaces: {
      ...global.workspaces,
      isCreatorOpen,
    },
  };
  setGlobal(global);
  return global;
}

addActionHandler('openWorkspaceCreator', (global): ActionReturnType => {
  updateWorkspaceSettings(global, { isCreatorOpen: true });
});

addActionHandler('closeWorkspaceCreator', (global): ActionReturnType => {
  updateWorkspaceSettings(global, { isCreatorOpen: false });
});