import type { FC } from '../../../lib/teact/teact';
import React, { memo } from '../../../lib/teact/teact';
import WorkspaceManager from './WorkspaceManager';
import SavedMessages from './SavedMessages';
import './CustomButtons.scss';

const CustomButtons: FC = () => {
  return (
    <div className="CustomButtons">
      <WorkspaceManager />
      <SavedMessages />
    </div>
  );
};

export default memo(CustomButtons);