import { memo, useEffect, useRef, useState, useMemo } from '../../../lib/teact/teact';
import { withGlobal, getActions } from '../../../global';

import type { ApiChat } from '../../../api/types';
import type { FocusMode } from '../../../types';
import type { GlobalState } from '../../../global/types';
import type { Command } from './types';

import { selectTabState } from '../../../global/selectors';
import buildClassName from '../../../util/buildClassName';
import useLang from '../../../hooks/useLang';
import useLastCallback from '../../../hooks/useLastCallback';
import { getAvailableCommands, searchCommands } from './commands';

import Avatar from '../../common/Avatar';
import Modal from '../../ui/Modal';
import InputText from '../../ui/InputText';
import PickerItem from '../../common/pickers/PickerItem';
import FullNameTitle from '../../common/FullNameTitle';
import Icon from '../../common/icons/Icon';

import styles from './CommandPalette.module.scss';

type SearchResult = {
  id: string;
  title: string;
  chat?: ApiChat;
};

type StateProps = {
  isOpen?: boolean;
  query?: string;
  chatIds?: string[];
  chatsById?: Record<string, ApiChat>;
  currentUserId?: string;
  focusMode?: FocusMode;
};

const CommandPalette = ({ isOpen, query = '', chatIds, chatsById, currentUserId, focusMode }: StateProps) => {
  const lang = useLang();
  const { closeCommandPalette, setCommandPaletteQuery, openChat } = getActions();

  const inputRef = useRef<HTMLInputElement>();
  const listRef = useRef<HTMLDivElement>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commandCategories = useMemo(() => {
    return getAvailableCommands(focusMode);
  }, [focusMode]);

  const commandResults = useMemo(() => {
    return searchCommands(commandCategories, query);
  }, [commandCategories, query]);

  const chatResults = useMemo(() => {
    if (!chatIds || !chatsById) {
      return [];
    }

    const searchQuery = query.toLowerCase().trim();
    const mappedChats = chatIds
      .map((id): SearchResult => ({
        id,
        title: chatsById[id]?.title || '',
        chat: chatsById[id],
      }))
      .filter((r) => r.title);

    if (!searchQuery) {
      return mappedChats.slice(0, 10);
    }

    return mappedChats.filter((r) => r.title.toLowerCase().includes(searchQuery));
  }, [query, chatIds, chatsById]);

  const totalResults = commandResults.length + chatResults.length;

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!listRef.current) return;
    
    const selectedItem = listRef.current.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | undefined;
    if (selectedItem) {
      selectedItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedIndex, totalResults]);

  const handleQueryChange = useLastCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCommandPaletteQuery({ query: e.target.value });
  });

  const handleKeyDown = useLastCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      closeCommandPalette();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, totalResults - 1));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (e.key === 'Enter' && totalResults > 0) {
      e.preventDefault();
      
      if (selectedIndex < commandResults.length) {
        const command = commandResults[selectedIndex];
        command.action();
        closeCommandPalette();
      } else {
        const chatIndex = selectedIndex - commandResults.length;
        const selected = chatResults[chatIndex];
        if (selected) {
          openChat({ id: selected.id, shouldReplaceHistory: true });
          closeCommandPalette();
        }
      }
    }
  });

  const handleChatClick = useLastCallback((chatId: string) => {
    openChat({ id: chatId, shouldReplaceHistory: true });
    closeCommandPalette();
  });

  const handleCommandClick = useLastCallback((command: Command) => {
    command.action();
    closeCommandPalette();
  });

  const renderCommands = () => {
    if (commandResults.length === 0) return null;

    return (
      <>
        <div className={styles.sectionHeader}>
          Commands
        </div>
        {commandResults.map((command, index) => (
          <div key={command.id} data-index={index}>
            <PickerItem
              className={buildClassName(
                styles.item,
                index === selectedIndex && styles.selected,
              )}
              title={command.title}
              subtitle={command.subtitle}
              avatarElement={(
                command.icon ? (
                  <div className={styles.commandIcon}>
                    <Icon name={command.icon} />
                  </div>
                ) : undefined
              )}
              ripple
              onClick={() => handleCommandClick(command)}
            />
          </div>
        ))}
      </>
    );
  };

  const renderChats = () => {
    if (chatResults.length === 0) return null;

    return (
      <>
        {commandResults.length > 0 && (
          <div className={styles.sectionHeader}>
            Chats
          </div>
        )}
        {chatResults.map((result, index) => {
          const isSavedMessages = result.id === currentUserId;
          const globalIndex = commandResults.length + index;

          return (
            <div key={result.id} data-index={globalIndex}>
              <PickerItem
                className={buildClassName(
                  styles.item,
                  globalIndex === selectedIndex && styles.selected,
                )}
                title={(
                  <div className="title-wrapper">
                    <FullNameTitle
                      className="item-title"
                      peer={result.chat!}
                      isSavedMessages={isSavedMessages}
                    />
                  </div>
                )}
                avatarElement={(
                  result.chat && (
                    <Avatar
                      peer={result.chat}
                      size="tiny"
                      isSavedMessages={isSavedMessages}
                    />
                  )
                )}
                ripple
                onClick={() => handleChatClick(result.id)}
              />
            </div>
          );
        })}
      </>
    );
  };

  if (!isOpen) {
    return undefined;
  }

  return (
    <Modal
      className={styles.root}
      isOpen={isOpen}
      onClose={closeCommandPalette}
      noBackdrop={false}
      noBackdropClose={false}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <InputText
            ref={inputRef}
            placeholder={lang('CommandPaletteSearchPlaceholder')}
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            teactExperimentControlled
          />
        </div>

        <div className={buildClassName(styles.results, 'custom-scroll')}>
          {totalResults === 0 ? (
            <div className={styles.noResults}>
              {lang('CommandPaletteNoResults')}
            </div>
          ) : (
            <div className={styles.list} ref={listRef}>
              {renderCommands()}
              {renderChats()}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default memo(
  withGlobal((global: GlobalState): StateProps => {
    const tabState = selectTabState(global);
    const { commandPalette } = tabState;
    const activeChatIds = global.chats.listIds.active || [];
    const archivedChatIds = global.chats.listIds.archived || [];
    const chatIds = [...activeChatIds, ...archivedChatIds];

    return {  
      isOpen: commandPalette?.isOpen,
      query: commandPalette?.query,
      chatIds,
      chatsById: global.chats.byId,
      currentUserId: global.currentUserId,
      focusMode: global.focusMode,
    };
  })(CommandPalette),
);
