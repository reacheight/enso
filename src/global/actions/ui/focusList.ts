import type { ActionReturnType } from '../../types';
import { getCurrentTabId } from '../../../util/establishMultitabRole';
import { updateTabState } from '../../reducers/tabs';
import { addActionHandler } from '../../index';
import { selectTabState } from '../../selectors';

addActionHandler('toggleFocusList', (global, actions, payload): ActionReturnType => {
  const { force, tabId = getCurrentTabId() } = payload ?? {};
  const isFocusListShown = force !== undefined ? force : !selectTabState(global, tabId).isFocusListShown;

  global = updateTabState(global, { isFocusListShown }, tabId);
  global = { ...global, lastIsFocusListShown: isFocusListShown };

  return global;
});

addActionHandler('addToFocusList', (global, actions, payload): ActionReturnType => {
  const { chatId, messageId } = payload;
  const messageKey = `${chatId}_${messageId}`;
  
  const currentMessageIds = global.focusList.messageIds;
  if (currentMessageIds.includes(messageKey)) {
    return global;
  }

  return {
    ...global,
    focusList: {
      ...global.focusList,
      messageIds: [...currentMessageIds, messageKey],
    },
  };
});

addActionHandler('removeFromFocusList', (global, actions, payload): ActionReturnType => {
  const { chatId, messageId } = payload;
  const messageKey = `${chatId}_${messageId}`;
  
  return {
    ...global,
    focusList: {
      ...global.focusList,
      messageIds: global.focusList.messageIds.filter(id => id !== messageKey),
    },
  };
});

addActionHandler('replaceFocusList', (global, actions, payload): ActionReturnType => {
  const { messageKeys } = payload;
  
  return {
    ...global,
    focusList: {
      ...global.focusList,
      messageIds: messageKeys,
    },
  };
});
