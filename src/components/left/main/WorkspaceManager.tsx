import type { FC } from '../../../lib/teact/teact';
import React, { memo, useCallback } from '../../../lib/teact/teact';
import { getActions } from '../../../global';
import { Workspace } from '../../../types';
import { useWorkspaceStorage } from '../../../hooks/useWorkspaceStorage';

import DropdownMenu from '../../ui/DropdownMenu';
import MenuItem from '../../ui/MenuItem';

import './WorkspaceManager.scss';
import buildClassName from '../../../util/buildClassName';
import Icon from '../../common/icons/Icon';
import MenuSeparator from '../../ui/MenuSeparator';
import Switcher from '../../ui/Switcher';

const WorkspaceManager: FC = () => {
  const { openWorkspaceCreator, openWorkspaceEditor, setActiveChatFolder } = getActions();
  const {
    savedWorkspaces,
    currentWorkspaceId,
    setCurrentWorkspaceId,
    excludeOtherWorkspaces,
    setExcludeOtherWorkspaces,
  } = useWorkspaceStorage();

  const everythingWorkspace: Workspace = { id: '0', name: 'Everything', foldersIds: [] };
  const selectedWorkspace = savedWorkspaces.find(workspace => workspace.id === currentWorkspaceId) || everythingWorkspace;

  const handleWorkspaceSelect = useCallback((workspace: Workspace) => {
    setCurrentWorkspaceId(workspace.id);
    setActiveChatFolder({ activeChatFolder: 0 }, { forceOnHeavyAnimation: true });
  }, [setCurrentWorkspaceId, setActiveChatFolder]);

  const handleCreateWorkspace = useCallback(() => {
    openWorkspaceCreator();
  }, [openWorkspaceCreator]);

  const handleSwitcherChange = useCallback((e) => {
    e.stopPropagation();
    setExcludeOtherWorkspaces(!excludeOtherWorkspaces);
  }, [excludeOtherWorkspaces, setExcludeOtherWorkspaces]);

  const renderTrigger = useCallback(({ onTrigger, isOpen }: { onTrigger: () => void; isOpen?: boolean }) => (
    <div
      key={selectedWorkspace?.id}
      onClick={onTrigger}
      className={buildClassName('WorkspaceManager-trigger', isOpen && 'active')}
    >
      <Icon name="my-notes" />
      {selectedWorkspace.name}
    </div>
  ), [selectedWorkspace]);

  return (
    <DropdownMenu
      className="WorkspaceManager-dropdown"
      trigger={renderTrigger}
      positionX="left"
    >
      {[everythingWorkspace, ...savedWorkspaces].map((workspace) => (
        <MenuItem
          key={workspace.id}
          onClick={() => handleWorkspaceSelect(workspace)}
          className="WorkspaceManager-workspace"
        >
          {workspace.name}
          {workspace.id === currentWorkspaceId && <Icon name="check" />}
        </MenuItem>
      ))}
      <MenuSeparator />
      <MenuItem
        icon="add"
        onClick={handleCreateWorkspace}
      >
        New Workspace
      </MenuItem>
      {selectedWorkspace.id !== everythingWorkspace.id && (
        <MenuItem
          icon="settings"
          onClick={() => openWorkspaceEditor({ workspaceId: selectedWorkspace.id })}
        >
          Workspace settings
        </MenuItem>
      )}
      {selectedWorkspace.id === everythingWorkspace.id && savedWorkspaces.length > 0 && (
        <MenuItem
          className="WorkspaceManager-excludeOther"
          onClick={handleSwitcherChange}
        >
          <Switcher
            checked={excludeOtherWorkspaces}
            label="Exclude folders from other workspaces"
          />
          Exclude others
        </MenuItem>
      )}
    </DropdownMenu>
  );
};

export default memo(WorkspaceManager);
