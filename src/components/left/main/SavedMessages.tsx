import { getActions, withGlobal } from '../../../global';
import { selectCurrentChat, selectIsChatWithSelf } from '../../../global/selectors';
import type { FC } from '../../../lib/teact/teact';
import React, { memo } from '../../../lib/teact/teact';
import buildClassName from '../../../util/buildClassName';
import Icon from '../../common/icons/Icon';

import './SavedMessages.scss';

type StateProps = {
  currentUserId?: string;
  isActive?: boolean;
}

const SavedMessages: FC<StateProps> = ({ currentUserId, isActive }) => {
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
    </div>
  );
};

export default memo(withGlobal<StateProps>(
  (global): StateProps => {
    const currentUserId = global.currentUserId!;
    const currentChat = selectCurrentChat(global);
    const isChatWithSelf = currentChat ? selectIsChatWithSelf(global, currentChat.id) : false;

    return {
      currentUserId,
      isActive: isChatWithSelf,
    }
  }
)(SavedMessages));