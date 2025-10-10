import { getActions, withGlobal } from '../../../global';
import { selectChat, selectCurrentChat, selectIsChatWithSelf } from '../../../global/selectors';
import type { FC } from '../../../lib/teact/teact';
import React, { memo } from '../../../lib/teact/teact';
import buildClassName from '../../../util/buildClassName';
import Icon from '../../common/icons/Icon';

import './SavedMessages.scss';

type StateProps = {
  currentUserId?: string;
  isActive?: boolean;
  savedMesagesUnreadCount?: number;
}

const SavedMessages: FC<StateProps> = ({ currentUserId, isActive, savedMesagesUnreadCount }) => {
  const { openChat, focusLastMessage } = getActions();

  return (
    <div
      onClick={() => {
        openChat({ id: currentUserId });
        focusLastMessage();
      }}
      className={buildClassName('SavedMessages-trigger', isActive && 'active')}
    >
      <Icon name="saved-messages" />  
      Saved
      {savedMesagesUnreadCount !== undefined && savedMesagesUnreadCount !== 0 && <span className="count">{savedMesagesUnreadCount}</span>}
    </div>
  );
};

export default memo(withGlobal<StateProps>(
  (global): StateProps => {
    const currentUserId = global.currentUserId!;
    const currentChat = selectCurrentChat(global);
    const savedMesagesUnreadCount = selectChat(global, currentUserId)?.unreadCount;
    const isChatWithSelf = currentChat ? currentChat.id === currentUserId : false;

    return {
      currentUserId,
      isActive: isChatWithSelf,
      savedMesagesUnreadCount,
    }
  }
)(SavedMessages));