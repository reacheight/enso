import type { FC } from '../../../lib/teact/teact';
import { memo, useState, useEffect, useRef } from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';

import type { TabState } from '../../../global/types/tabState';

import { MAIN_THREAD_ID } from '../../../api/types';
import captureEscKeyListener from '../../../util/captureEscKeyListener';

import useLang from '../../../hooks/useLang';
import useLastCallback from '../../../hooks/useLastCallback';
import useSchedule from '../../../hooks/useSchedule';

import Modal from '../../ui/Modal';
import TextArea from '../../ui/TextArea';
import Button from '../../ui/Button';

import './QuickReminderModal.scss';
import Icon from '../../common/icons/Icon';

export type OwnProps = {
  modal?: TabState['quickReminderModal'];
};

type StateProps = {
  currentUserId?: string;
};

const QuickReminderModal: FC<OwnProps & StateProps> = ({
  modal,
  currentUserId,
}) => {
  const lang = useLang();
  const {
    closeQuickReminderModal,
    sendMessage,
  } = getActions();

  const inputRef = useRef<HTMLTextAreaElement>(null!);
  const [reminderText, setReminderText] = useState('');

  const isOpen = modal?.isOpen || false;

  const [requestCalendar, calendar] = useSchedule(false, () => {
    closeQuickReminderModal();
  }, undefined, true);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setReminderText('');
    }
  }, [isOpen]);

  useEffect(() => (isOpen ? captureEscKeyListener(() => closeQuickReminderModal()) : undefined), [isOpen]);

  const handleReminderSchedule = useLastCallback((scheduledAt: number) => {
    if (!currentUserId || !reminderText.trim()) {
      return;
    }

    sendMessage({
      text: reminderText.trim(),
      scheduledAt,
      messageList: {
        chatId: currentUserId,
        threadId: MAIN_THREAD_ID,
        type: 'scheduled',
      },
    });

    closeQuickReminderModal();
  });

  const handleSelectTime = useLastCallback(() => {
    if (!reminderText.trim()) {
      return;
    }

    requestCalendar(handleReminderSchedule);
  });

  const handleClose = useLastCallback(() => {
    closeQuickReminderModal();
  });

  const handleInputChange = useLastCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReminderText(e.target.value);
  });

  const handleKeyDown = useLastCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      if (reminderText.trim()) {
        handleSelectTime();
      }
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="QuickReminderModal"
      style="padding: 0.5rem;"
    >
      <div className="QuickReminderModal__content">
        <TextArea
          ref={inputRef}
          value={reminderText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={lang('QuickReminderModalPlaceholder')}
          noReplaceNewlines
        />
        <Button
          onClick={handleSelectTime}
          disabled={!reminderText.trim()}
          color="primary"
          size="smaller"
          round
        >
          <Icon name='send' />
        </Button>
      </div>
      {calendar}
    </Modal>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): StateProps => {
    return {
      currentUserId: global.currentUserId,
    };
  },
)(QuickReminderModal));
