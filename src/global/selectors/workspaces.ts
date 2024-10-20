import type { GlobalState } from '../types';

export function selectIsWorkspaceCreatorOpen<T extends GlobalState>(global: T) {
  return global.workspaces.isCreatorOpen;
}
