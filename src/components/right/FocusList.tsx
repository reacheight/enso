import type { FC } from '@teact';
import { memo } from '@teact';
import { getActions, withGlobal } from '../../global';

import type { ApiMessage } from '../../api/types';

import { selectFocusListMessages } from '../../global/selectors';
import { getMessageOriginalId } from '../../global/helpers/messages';

import useLastCallback from '../../hooks/useLastCallback';

import NothingFound from '../common/NothingFound';
import SenderGroupContainer from '../middle/message/SenderGroupContainer';

import './FocusList.scss';
import Message from '../middle/message/Message';
import { MAIN_THREAD_ID } from '../../api/types';

type OwnProps = {
  isActive: boolean;
};

type StateProps = {
  focusMessages: ApiMessage[];
};

const FocusList: FC<OwnProps & StateProps> = ({
  isActive,
  focusMessages,
}) => {
  const { focusMessage } = getActions();

  const handleMessageClick = useLastCallback((message: ApiMessage) => {
    focusMessage({ chatId: message.chatId, messageId: message.id });
  });

  if (!isActive) {
    return undefined;
  }

  return (
    <div className="FocusList">
      <div className="FocusList__content">
        {focusMessages.length === 0 ? (
          <NothingFound
            text="No messages in Focus"
            description="Add important messages to your Focus list for quick access"
          />
        ) : (
          <div className="FocusList__messages">
            {focusMessages.map((message, i) => {
              const messageId = getMessageOriginalId(message);
              const withAvatar = true;

              return (
                <div key={`${message.chatId}_${message.id}`} className="FocusList__message-item">
                  <div
                    className="FocusList__message-content"
                    onClick={() => handleMessageClick(message)}
                  >
                    <SenderGroupContainer
                      key={`sender-${messageId}`}
                      id={`focus-message-group-${messageId}`}
                      message={message}
                      withAvatar={withAvatar}
                      appearanceOrder={-1}
                    >
                      <Message
                        message={message}
                        withAvatar={withAvatar}
                        withSenderName
                        threadId={MAIN_THREAD_ID}
                        messageListType='thread'
                        noComments
                        noReplies
                        noReactions
                        appearAsNotOwn
                        appearanceOrder={-1}
                        isJustAdded={false}
                        isFirstInGroup
                        isLastInGroup
                        isFirstInDocumentGroup
                        isLastInDocumentGroup
                        isLastInList={i === focusMessages.length - 1}
                        isInFocusList
                      />
                    </SenderGroupContainer>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): StateProps => ({
    focusMessages: selectFocusListMessages(global),
  }),
)(FocusList));
