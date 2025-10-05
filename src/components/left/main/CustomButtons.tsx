import type { FC } from '../../../lib/teact/teact';
import React, { memo } from '../../../lib/teact/teact';
import WorkspaceManager from './WorkspaceManager';
import SavedMessages from './SavedMessages';
import FocusListButton from './FocusListButton';
import './CustomButtons.scss';

const CustomButtons: FC = () => {
  return (
    <div className="CustomButtons">
      <WorkspaceManager />
      <SavedMessages />
      <FocusListButton />
    </div>
  );
};

export default memo(CustomButtons);