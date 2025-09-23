import type { FC } from '../../../lib/teact/teact';
import React, { memo, useCallback } from '../../../lib/teact/teact';
import { getActions } from '../../../global';
import { Workspace } from '../../../types';
import { useStorage } from '../../../hooks/useStorage';

import DropdownMenu from '../../ui/DropdownMenu';
import MenuItem from '../../ui/MenuItem';

import './WorkspaceManager.scss';
import buildClassName from '../../../util/buildClassName';
import Button from '../../ui/Button';
import Icon from '../../common/icons/Icon';

const WorkspaceManager: FC = () => {
  const { openWorkspaceCreator, openWorkspaceEditor, setActiveChatFolder } = getActions();
  const { savedWorkspaces, currentWorkspaceId, setCurrentWorkspaceId } = useStorage();

  const everythingWorkspace: Workspace = { id: '0', name: 'Everything', foldersIds: [] };
  const selectedWorkspace = savedWorkspaces.find(workspace => workspace.id === currentWorkspaceId) || everythingWorkspace;

  const handleWorkspaceSelect = useCallback((workspace: Workspace) => {
    setCurrentWorkspaceId(workspace.id);
    setActiveChatFolder({ activeChatFolder: 0 }, { forceOnHeavyAnimation: true });
  }, [setCurrentWorkspaceId, setActiveChatFolder]);

  const handleCreateWorkspace = useCallback(() => {
    openWorkspaceCreator();
  }, [openWorkspaceCreator]);

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
          className="WorkspaceManager-item"
        >
          <div className="WorkspaceManager-item-name">
            {workspace.name}
            {workspace.id === currentWorkspaceId && <Icon name="check" />}
          </div>
          {workspace.id !== everythingWorkspace.id && (
            <Button
              size="tiny"
              isText
              round
              color="translucent"
              nonInteractive
              allowDisabledClick
              shouldStopPropagation
              ariaLabel={`Edit ${workspace.name} workspace`}
              onClick={(e) => openWorkspaceEditor({ workspaceId: workspace.id }) }
            >
              <Icon name="edit" />
            </Button>
          )}
        </MenuItem>
      ))}
      <MenuItem
        icon="add"
        onClick={handleCreateWorkspace}
        className="WorkspaceManager-newItem"
      >
        New Workspace
      </MenuItem>
    </DropdownMenu>
  );
};

export default memo(WorkspaceManager);
