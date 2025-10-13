import type { FC } from '@teact';
import { memo, useCallback, useEffect, useMemo, useState } from '../../lib/teact/teact';
import { getActions, withGlobal } from '../../global';

import type { ApiMessage } from '../../api/types';

import { selectFocusListMessages, selectTheme, selectThemeValues } from '../../global/selectors';
import { getMessageOriginalId } from '../../global/helpers/messages';

import buildStyle from '../../util/buildStyle';

import NothingFound from '../common/NothingFound';
import SenderGroupContainer from '../middle/message/SenderGroupContainer';
import Draggable from '../ui/Draggable';

import './FocusList.scss';
import Message from '../middle/message/Message';
import { MAIN_THREAD_ID } from '../../api/types';

type OwnProps = {
  isActive: boolean;
};

type StateProps = {
  focusMessages?: ApiMessage[];
  patternColor?: string;
};

type FocusListState = {
  orderedMessageKeys?: string[];
  dragOrderMessageKeys?: string[];
  draggedKey?: string;
  messageHeights: Record<string, number>;
};

const DEFAULT_MESSAGE_HEIGHT = 80;

const FocusList: FC<OwnProps & StateProps> = ({
  isActive,
  focusMessages,
  patternColor,
}) => {
  const { focusMessage, replaceFocusList } = getActions();
  
  const [state, setState] = useState<FocusListState>({
    messageHeights: {},
  });

  useEffect(() => {
    if (focusMessages) {
      const messageKeys = focusMessages.map(msg => `${msg.chatId}_${msg.id}`);
      setState(prev => ({
        ...prev,
        orderedMessageKeys: messageKeys,
        dragOrderMessageKeys: messageKeys,
      }));
    }
  }, [focusMessages]);

  const handleMessageRef = useCallback((el: HTMLDivElement | null | undefined, messageKey: string) => {
    if (el && !state.messageHeights[messageKey]) {
      const height = el.offsetHeight;
      if (height > 0) {
        setState(prev => ({
          ...prev,
          messageHeights: { ...prev.messageHeights, [messageKey]: height },
        }));
      }
    }
  }, []);

  const handleMessageClick = useCallback((message: ApiMessage) => {
    focusMessage({ chatId: message.chatId, messageId: message.id });
  }, [focusMessage]);

  const getMessageHeight = useCallback((messageKey: string) => {
    return state.messageHeights[messageKey] || DEFAULT_MESSAGE_HEIGHT;
  }, [state.messageHeights]);

  const getTotalHeightUpTo = useCallback((messageKeys: string[], upToIndex: number) => {
    let total = 0;
    for (let i = 0; i < upToIndex; i++) {
      total += getMessageHeight(messageKeys[i]);
    }
    return total;
  }, [getMessageHeight]);

  const handleDrag = useCallback((translation: { x: number; y: number }, id: string | number) => {
    if (!state.orderedMessageKeys) return;

    const messageKey = id as string;
    const index = state.orderedMessageKeys.indexOf(messageKey);
    
    if (index === -1) return;

    let targetIndex = index;
    
    if (translation.y > 0) {
      let offset = translation.y;
      for (let i = index + 1; i < state.orderedMessageKeys.length; i++) {
        const nextHeight = getMessageHeight(state.orderedMessageKeys[i]);
        if (offset > nextHeight / 2) {
          offset -= nextHeight;
          targetIndex = i;
        } else {
          break;
        }
      }
    } else if (translation.y < 0) {
      let offset = -translation.y;
      for (let i = index - 1; i >= 0; i--) {
        const prevHeight = getMessageHeight(state.orderedMessageKeys[i]);
        if (offset > prevHeight / 2) {
          offset -= prevHeight;
          targetIndex = i;
        } else {
          break;
        }
      }
    }

    const dragOrderKeys = state.orderedMessageKeys.filter(key => key !== messageKey);
    dragOrderKeys.splice(targetIndex, 0, messageKey);
    
    setState(current => ({
      ...current,
      draggedKey: messageKey,
      dragOrderMessageKeys: dragOrderKeys,
    }));
  }, [getMessageHeight, state.orderedMessageKeys]);

  const handleDragEnd = useCallback(() => {
    if (state.dragOrderMessageKeys) {
      setState(current => ({
        ...current,
        draggedKey: undefined,
        dragOrderMessageKeys: current.dragOrderMessageKeys,
        orderedMessageKeys: current.dragOrderMessageKeys,
      }));
      replaceFocusList({ messageKeys: state.dragOrderMessageKeys });
    }
  }, [replaceFocusList, state.dragOrderMessageKeys]);

  if (!isActive || !focusMessages || !state.dragOrderMessageKeys) {
    return undefined;
  }
  
  const minHeight = useMemo(
    () => focusMessages
      .map(msg => `${msg.chatId}_${msg.id}`)
      .reduce((sum, key) => sum + getMessageHeight(key), 0),
    [focusMessages, getMessageHeight],
  );

  return (
    <div className="FocusList" style={buildStyle(`--pattern-color: ${patternColor}`)}>
      <div className="FocusList__content custom-scroll">
        {focusMessages.length === 0 ? (
          <div className="FocusList__empty">
            <NothingFound
              text="No messages in Priority"
              description="Add important messages to your Priority list for quick access"
            />
          </div>
        ) : (
          <div className="FocusList__messages" style={`min-height: ${minHeight}px`}>
            {focusMessages.map((message, i) => {
              const messageKey = `${message.chatId}_${message.id}`;
              const messageId = getMessageOriginalId(message);
              const withAvatar = true;
              
              const isDragged = state.draggedKey === messageKey;
              const originalIndex = state.orderedMessageKeys?.indexOf(messageKey) ?? i;
              const currentIndex = state.dragOrderMessageKeys?.indexOf(messageKey) ?? i;
              
              const draggedTop = getTotalHeightUpTo(state.orderedMessageKeys || [], originalIndex);
              const top = getTotalHeightUpTo(state.dragOrderMessageKeys || [], currentIndex);

              return (
                <Draggable
                  key={messageKey}
                  id={messageKey}
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                  style={`top: ${isDragged ? draggedTop : top}px;`}
                  isDisabled={!isActive}
                >
                  <div
                    ref={(el) => handleMessageRef(el, messageKey)}
                    className="FocusList__message-item"
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
                        isLastInList={currentIndex === focusMessages.length - 1}
                        isInFocusList
                      />
                    </SenderGroupContainer>
                  </div>
                </Draggable>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): StateProps => {
    const theme = selectTheme(global);
    const { patternColor } = selectThemeValues(global, theme) || {};
    
    return {
      focusMessages: selectFocusListMessages(global),
      patternColor,
    };
  },
)(FocusList));
