import type { ApiUser } from '../../../api/types';
import type { Workspace } from '../../../types';
import { FC, memo } from '../../../lib/teact/teact';
import { EVERYTHING_WORKSPACE_ID } from '../../../global/selectors/workspaces';
import Avatar, { AvatarSize } from '../../common/Avatar';

type OwnProps = {
  workspace: Workspace;
  currentUser?: ApiUser;
  size?: AvatarSize;
  isRectangular?: boolean;
};

const WorkspaceAvatar: FC<OwnProps> = ({ workspace, currentUser, size, isRectangular = true }) => {
  return workspace.id === EVERYTHING_WORKSPACE_ID
    ? <Avatar isRectangular={isRectangular} peer={currentUser} size={size} />
    : <Avatar isRectangular={isRectangular} size={size} text={workspace.name} />
};

export default memo(WorkspaceAvatar);