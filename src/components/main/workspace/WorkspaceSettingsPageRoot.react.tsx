import React from 'react';
import { createRoot } from 'react-dom/client';
import WorkspaceSettingsPage from './WorkspaceSettingsPage.react';

const workspaceSettingsElement = document.getElementById('workspace-settings');
const workspaceSettingsRoot = createRoot(workspaceSettingsElement!);

interface OwnProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId?: number;
}

const WorkspaceSettingsPageRoot: React.FC<OwnProps> = ({ isOpen, onClose, workspaceId }) => {
  workspaceSettingsRoot.render(
    isOpen ? (
      <WorkspaceSettingsPage onBack={onClose} workspaceId={workspaceId} /> 
    ) : undefined,
  );

  return undefined;
};

export default WorkspaceSettingsPageRoot;
