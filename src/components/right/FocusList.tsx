import { type FC, useEffect } from '@teact';
import { memo } from '@teact';
import { getActions, withGlobal } from '../../global';

import type { ApiMessage } from '../../api/types';

import { selectFocusListMessageKeys, selectFocusListMessages } from '../../global/selectors';
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
  focusMessages?: ApiMessage[];
  focusMessagesKeys?: string[];
};

const FocusList: FC<OwnProps & StateProps> = ({
  isActive,
  focusMessages,
  focusMessagesKeys,
}) => {
  const { focusMessage, removeFromFocusList } = getActions();

  const handleMessageClick = useLastCallback((message: ApiMessage) => {
    focusMessage({ chatId: message.chatId, messageId: message.id });
  });

  if (!isActive || !focusMessages || !focusMessagesKeys) {
    return undefined;
  }

  useEffect(() => {
    if (!focusMessagesKeys || !focusMessages) return;

    focusMessagesKeys.forEach((messageKey) => {
      const [chatId, messageIdStr] = messageKey.split('_');
      const messageId = parseInt(messageIdStr, 10);

      if (!focusMessages.some((message) => message.chatId === chatId && message.id === messageId)) {
        removeFromFocusList({ chatId, messageId });
      }
    });
  }, [focusMessagesKeys, focusMessages, removeFromFocusList, focusMessage]);

  return (
    <div className="FocusList">
      <div className="FocusList__content custom-scroll">
        {focusMessages.length === 0 ? (
          <div className="FocusList__empty">
            <NothingFound
              text="No messages in Priority"
              description="Add important messages to your Priority list for quick access"
            />
          </div>
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
                      isInFocusList
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
    focusMessagesKeys: selectFocusListMessageKeys(global),
  }),
)(FocusList));
