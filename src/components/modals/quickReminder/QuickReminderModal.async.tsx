import type { FC } from '../../../lib/teact/teact';
import { memo } from '../../../lib/teact/teact';
import { Bundles } from '../../../util/moduleLoader';

import type { OwnProps } from './QuickReminderModal';

import useModuleLoader from '../../../hooks/useModuleLoader';

const QuickReminderModalAsync: FC<OwnProps> = (props) => {
  const { modal } = props;
  const QuickReminderModal = useModuleLoader(Bundles.Extra, 'QuickReminderModal', !modal);

  return QuickReminderModal ? <QuickReminderModal {...props} /> : undefined;
};

export default memo(QuickReminderModalAsync);

