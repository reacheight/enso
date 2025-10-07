import type { FC } from '../../../lib/teact/teact';
import React, { memo } from '../../../lib/teact/teact';
import WorkspaceManager from './WorkspaceManager';
import SavedMessages from './SavedMessages';
import FocusListButton from './FocusListButton';
import './CustomButtons.scss';

const CustomButtons: FC = () => {
  return (
    <div className="CustomButtons">
      <div className="workspace-manager">
        <WorkspaceManager />
      </div>
      <SavedMessages />
      <FocusListButton />
    </div>
  );
};

export default memo(CustomButtons);