import type { FC } from '../../../lib/teact/teact';
import React, { memo, useCallback } from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';
import type { Workspace } from '../../../types';

import DropdownMenu from '../../ui/DropdownMenu';
import MenuItem from '../../ui/MenuItem';

import './WorkspaceManager.scss';
import buildClassName from '../../../util/buildClassName';
import Icon from '../../common/icons/Icon';
import UnreadBadge from '../../common/CustomUnreadBadge';
import MenuSeparator from '../../ui/MenuSeparator';
import Switcher from '../../ui/Switcher';
import type { ApiUser } from '../../../api/types';
import { selectUser } from '../../../global/selectors/users';
import {
  selectWorkspaces,
  selectCurrentWorkspace,
  selectExcludeOtherWorkspaces,
  selectWorkspaceUnreadUnmutedChatsCount,
  EVERYTHING_WORKSPACE_ID,
} from '../../../global/selectors/workspaces';
import WorkspaceAvatar from './WorkspaceAvatar';

type StateProps = {
  currentUser?: ApiUser;
  allWorkspaces: Workspace[];
  currentWorkspace: Workspace;
  excludeOtherWorkspaces: boolean;
  workspacesUnreadCounts: Record<string, number>;
  focusMode?: 'deepWork' | 'noDistraction';
};

const WorkspaceManager: FC<StateProps> = ({
  currentUser,
  allWorkspaces,
  currentWorkspace,
  excludeOtherWorkspaces,
  workspacesUnreadCounts,
  focusMode,
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

  const renderTrigger = useCallback(({ onTrigger, isOpen }: { onTrigger: () => void; isOpen?: boolean }) => {
    const hasUnreadInOtherWorkspaces = Object.entries(workspacesUnreadCounts).some(
      ([workspaceId, unreadCount]) => workspaceId !== currentWorkspace.id && unreadCount > 0
    );
    const shouldShowIndicator = hasUnreadInOtherWorkspaces && focusMode !== 'deepWork';

    return (
      <div
        key={currentWorkspace.id}
        onClick={onTrigger}
        className={buildClassName('WorkspaceManager-trigger', isOpen && 'active')}
      >
        <div className="WorkspaceManager-trigger-avatar">
          <WorkspaceAvatar workspace={currentWorkspace} currentUser={currentUser} size="tiny" />
          {shouldShowIndicator && (
            <div className="WorkspaceManager-trigger-badge" />
          )}
        </div>
        {currentWorkspace.name}
      </div>
    );
  }, [currentWorkspace, currentUser, workspacesUnreadCounts, focusMode]);

  const renderWorkspaceItem = useCallback((workspace: Workspace) => {
    const unreadCount = workspacesUnreadCounts[workspace.id];
    const isOtherWorkspace = workspace.id !== currentWorkspace.id;
    const shouldShowBadge = unreadCount > 0 && isOtherWorkspace && focusMode !== 'deepWork';

    return (
      <MenuItem
        key={workspace.id}
        onClick={() => handleWorkspaceSelect(workspace)}
        className="WorkspaceManager-workspace"
        customIcon={<WorkspaceAvatar workspace={workspace} currentUser={currentUser} size="mini" />}
      >
        <div className="WorkspaceManager-workspace-content">
          <span className="WorkspaceManager-workspace-name">{workspace.name}</span>
          <div className="WorkspaceManager-workspace-right">
            {shouldShowBadge && (
              <UnreadBadge count={unreadCount} />
            )}
            {workspace.id === currentWorkspace.id && <Icon name="check" />}
          </div>
        </div>
      </MenuItem>
    );
  }, [currentWorkspace.id, currentUser, handleWorkspaceSelect, workspacesUnreadCounts, focusMode]);

  return (
    <DropdownMenu
      className="WorkspaceManager-dropdown"
      trigger={renderTrigger}
      positionX="left"
    >
      {allWorkspaces.map(renderWorkspaceItem)}
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

export default memo(withGlobal(
  (global): StateProps => {
    const allWorkspaces = selectWorkspaces(global);
    const workspacesUnreadCounts: Record<string, number> = {};

    allWorkspaces.forEach((workspace) => {
      workspacesUnreadCounts[workspace.id] = selectWorkspaceUnreadUnmutedChatsCount(global, workspace);
    });

    return {
      currentUser: selectUser(global, global.currentUserId!),
      allWorkspaces,
      currentWorkspace: selectCurrentWorkspace(global),
      excludeOtherWorkspaces: selectExcludeOtherWorkspaces(global),
      workspacesUnreadCounts,
      focusMode: global.focusMode,
    };
  },
)(WorkspaceManager));