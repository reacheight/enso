import type { FC } from '../../../lib/teact/teact';
import React, { memo, useCallback } from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';
import type { Workspace } from '../../../types';

import DropdownMenu from '../../ui/DropdownMenu';
import MenuItem from '../../ui/MenuItem';

import './WorkspaceManager.scss';
import buildClassName from '../../../util/buildClassName';
import Icon from '../../common/icons/Icon';
import MenuSeparator from '../../ui/MenuSeparator';
import Switcher from '../../ui/Switcher';
import type { ApiUser } from '../../../api/types';
import { selectUser } from '../../../global/selectors/users';
import {
  selectWorkspaces,
  selectCurrentWorkspace,
  selectExcludeOtherWorkspaces,
  EVERYTHING_WORKSPACE_ID,
} from '../../../global/selectors/workspaces';
import WorkspaceAvatar from './WorkspaceAvatar';

type StateProps = {
  currentUser?: ApiUser;
  allWorkspaces: Workspace[];
  currentWorkspace: Workspace;
  excludeOtherWorkspaces: boolean;
};

const WorkspaceManager: FC<StateProps> = ({
  currentUser,
  allWorkspaces,
  currentWorkspace,
  excludeOtherWorkspaces,
}) => {
  const {
    openWorkspaceCreator,
    openWorkspaceEditor,
    setActiveChatFolder,
    setCurrentWorkspace,
    setExcludeOtherWorkspaces: setExcludeOtherWorkspacesAction,
  } = getActions();

  const handleWorkspaceSelect = useCallback((workspace: Workspace) => {
    setCurrentWorkspace({ workspaceId: workspace.id });
    setActiveChatFolder({ activeChatFolder: 0 }, { forceOnHeavyAnimation: true });
  }, [setCurrentWorkspace, setActiveChatFolder]);

  const handleCreateWorkspace = useCallback(() => {
    openWorkspaceCreator();
  }, [openWorkspaceCreator]);

  const handleSwitcherChange = useCallback((e) => {
    e.stopPropagation();
    setExcludeOtherWorkspacesAction({ excludeOtherWorkspaces: !excludeOtherWorkspaces });
  }, [excludeOtherWorkspaces, setExcludeOtherWorkspacesAction]);

  const renderTrigger = useCallback(({ onTrigger, isOpen }: { onTrigger: () => void; isOpen?: boolean }) => (
    <div
      key={currentWorkspace.id}
      onClick={onTrigger}
      className={buildClassName('WorkspaceManager-trigger', isOpen && 'active')}
    >
      <WorkspaceAvatar workspace={currentWorkspace} currentUser={currentUser} size="tiny" />
      {currentWorkspace.name}
    </div>
  ), [currentWorkspace, currentUser]);

  return (
    <DropdownMenu
      className="WorkspaceManager-dropdown"
      trigger={renderTrigger}
      positionX="left"
    >
      {allWorkspaces.map((workspace) => (
        <MenuItem
          key={workspace.id}
          onClick={() => handleWorkspaceSelect(workspace)}
          className="WorkspaceManager-workspace"
          customIcon={<WorkspaceAvatar workspace={workspace} currentUser={currentUser} size="mini" />}
        >
          {workspace.name}
          {workspace.id === currentWorkspace.id && <Icon name="check" />}
        </MenuItem>
      ))}
      <MenuSeparator />
      <MenuItem
        icon="add"
        onClick={handleCreateWorkspace}
      >
        New Workspace
      </MenuItem>
      {currentWorkspace.id !== EVERYTHING_WORKSPACE_ID && (
        <MenuItem
          icon="settings"
          onClick={() => openWorkspaceEditor({ workspaceId: currentWorkspace.id })}
        >
          Workspace settings
        </MenuItem>
      )}
      {currentWorkspace.id === EVERYTHING_WORKSPACE_ID && allWorkspaces.length > 1 && (
        <MenuItem
          className="WorkspaceManager-excludeOther"
          onClick={handleSwitcherChange}
        >
          <Switcher
            checked={excludeOtherWorkspaces}
            label="Exclude folders and chats from other workspaces"
          />
          Exclude others
        </MenuItem>
      )}
    </DropdownMenu>
  );
};

export default memo(withGlobal<StateProps>(
  (global): StateProps => {
    return {
      currentUser: selectUser(global, global.currentUserId!),
      allWorkspaces: selectWorkspaces(global),
      currentWorkspace: selectCurrentWorkspace(global),
      excludeOtherWorkspaces: selectExcludeOtherWorkspaces(global),
    };
  },
)(WorkspaceManager));