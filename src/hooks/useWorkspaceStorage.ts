import { useMemo } from '../lib/teact/teact';

import type { GlobalState } from '../global/types';
import type { Workspace } from '../types';
import useSelector from './data/useSelector';
import { useLocalStorage } from './useStorage';

function selectCurrentUserId(global: GlobalState) {
  return global.currentUserId;
}

export function useWorkspaceStorage() {
  const currentUserId = useSelector(selectCurrentUserId);

  const workspacesKey = useMemo(() => {
    return currentUserId ? `workspaces_${currentUserId}` : 'workspaces';
  }, [currentUserId]);

  const workspaceIdKey = useMemo(() => {
    return currentUserId ? `currentWorkspaceId_${currentUserId}` : 'currentWorkspaceId';
  }, [currentUserId]);

  const excludeOtherWorkspacesKey = useMemo(() => {
    return currentUserId ? `excludeOtherWorkspaces_${currentUserId}` : 'excludeOtherWorkspaces';
  }, [currentUserId]);

  const [savedWorkspaces, setSavedWorkspaces] = useLocalStorage<Workspace[]>({
    key: workspacesKey,
    initValue: [],
  });
  const [
    currentWorkspaceId,
    setCurrentWorkspaceId,
  ] = useLocalStorage<string>({
    key: workspaceIdKey,
    initValue: "0",
  });

  const [excludeOtherWorkspaces, setExcludeOtherWorkspaces] = useLocalStorage<boolean>({
    key: excludeOtherWorkspacesKey,
    initValue: false,
  });

  return {
    savedWorkspaces,
    setSavedWorkspaces,
    currentWorkspaceId,
    setCurrentWorkspaceId,
    excludeOtherWorkspaces,
    setExcludeOtherWorkspaces,
  };
}
