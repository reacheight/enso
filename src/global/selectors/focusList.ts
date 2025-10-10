import type { GlobalState } from '../types';
import type { ApiMessage } from '../../api/types';

export function selectFocusListMessages(global: GlobalState): ApiMessage[] {
  const { focusList, messages } = global;
  
  return focusList.messageIds
    .map(messageKey => {
      const [chatId, messageIdStr] = messageKey.split('_');
      const messageId = parseInt(messageIdStr, 10);
      
      const chatMessages = messages.byChatId[chatId];
      if (!chatMessages) return undefined;
      
      return chatMessages.byId[messageId];
    })
    .filter((message): message is ApiMessage => message !== undefined);
}

export function selectFocusListMessageKeys(global: GlobalState): string[] {
  return global.focusList.messageIds;
}

export function selectFocusListCount(global: GlobalState): number {
  return global.focusList.messageIds.length;
}

export function selectIsMessageInFocusList(
  global: GlobalState,
  chatId: string,
  messageId: number,
): boolean {
  const messageKey = `${chatId}_${messageId}`;
  return global.focusList.messageIds.includes(messageKey);
}
