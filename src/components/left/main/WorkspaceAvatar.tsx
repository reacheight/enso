import type { ApiUser } from '../../../api/types';
import type { Workspace } from '../../../types';
import { FC, memo } from '../../../lib/teact/teact';
import { EVERYTHING_WORKSPACE_ID } from '../../../global/selectors/workspaces';
import Avatar, { AvatarSize } from '../../common/Avatar';

type OwnProps = {
  workspace: Workspace;
  currentUser?: ApiUser;
  size?: AvatarSize;
};

const WorkspaceAvatar: FC<OwnProps> = ({ workspace, currentUser, size }) => {
  return workspace.id === EVERYTHING_WORKSPACE_ID
    ? <Avatar isRectangular peer={currentUser} size={size} />
    : <Avatar isRectangular size={size} text={workspace.name} />
};

export default memo(WorkspaceAvatar);