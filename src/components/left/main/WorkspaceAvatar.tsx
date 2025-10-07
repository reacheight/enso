import { ApiUser } from '../../../api/types';
import { FC, memo } from '../../../lib/teact/teact';
import { Workspace } from '../../../types';
import Avatar, { AvatarSize } from '../../common/Avatar';

type OwnProps = {
  workspace: Workspace;
  currentUser?: ApiUser;
  size?: AvatarSize;
};

const WorkspaceAvatar: FC<OwnProps> = ({ workspace, currentUser, size }) => {
  const everythingWorkspaceId = '0';

  return workspace.id === everythingWorkspaceId
    ? <Avatar isRectangular peer={currentUser} size={size} />
    : <Avatar isRectangular size={size} text={workspace.name} />
};

export default memo(WorkspaceAvatar);