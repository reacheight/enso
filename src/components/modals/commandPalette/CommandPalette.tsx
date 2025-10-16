import { memo, useEffect, useRef, useState, useMemo } from '../../../lib/teact/teact';
import { withGlobal, getActions } from '../../../global';

import type { ApiChat } from '../../../api/types';
import type { GlobalState } from '../../../global/types';

import { selectTabState } from '../../../global/selectors';
import buildClassName from '../../../util/buildClassName';
import useLang from '../../../hooks/useLang';
import useLastCallback from '../../../hooks/useLastCallback';

import Avatar from '../../common/Avatar';
import Modal from '../../ui/Modal';
import InputText from '../../ui/InputText';
import PickerItem from '../../common/pickers/PickerItem';
import FullNameTitle from '../../common/FullNameTitle';

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
};

const CommandPalette = ({ isOpen, query = '', chatIds, chatsById, currentUserId }: StateProps) => {
  const lang = useLang();
  const { closeCommandPalette, setCommandPaletteQuery, openChat } = getActions();

  const inputRef = useRef<HTMLInputElement>();
  const listRef = useRef<HTMLDivElement>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results = useMemo(() => {
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

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const selectedItem = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    if (selectedItem) {
      selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedIndex, results]);

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
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      const selected = results[selectedIndex];
      if (selected) {
        openChat({ id: selected.id, shouldReplaceHistory: true });
        closeCommandPalette();
      }
    }
  });

  const handleItemClick = useLastCallback((chatId: string) => {
    openChat({ id: chatId, shouldReplaceHistory: true });
    closeCommandPalette();
  });

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
          {results.length === 0 ? (
            <div className={styles.noResults}>
              {lang('CommandPaletteNoResults')}
            </div>
          ) : (
            <div className={styles.list} ref={listRef}>
              {results.map((result, index) => {
                const isSavedMessages = result.id === currentUserId;

                return (
                  <PickerItem
                    key={result.id}
                    className={buildClassName(
                      styles.item,
                      index === selectedIndex && styles.selected,
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
                    onClick={() => handleItemClick(result.id)}
                  />
                );
              })}
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
    const chatIds = global.chats.listIds.active || [];

    return {
      isOpen: commandPalette?.isOpen,
      query: commandPalette?.query,
      chatIds,
      chatsById: global.chats.byId,
      currentUserId: global.currentUserId,
    };
  })(CommandPalette),
);
