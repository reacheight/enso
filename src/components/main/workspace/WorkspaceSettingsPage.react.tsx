import type { FC } from 'react';
import React, { useState, useCallback, useEffect } from 'react';
import styles from './WorkspaceSettingsPage.module.scss';

import useLastCallback from '../../../hooks/useLastCallback';
import { useStorage } from '../../../hooks/useStorage';
import { Workspace } from '../../../types';

interface OwnProps {
  onBack: () => void;
  workspaceId?: string;
}

const WorkspaceSettingsPage: FC<OwnProps> = ({ onBack, workspaceId }) => {
  const [workspaceName, setWorkspaceName] = useState('');
  const { savedWorkspaces, setSavedWorkspaces } = useStorage();

  useEffect(() => {
    if (workspaceId) {
      const workspace = savedWorkspaces.find(w => w.id === workspaceId);
      if (workspace) {
        setWorkspaceName(workspace.name);
      }
    }
  }, [workspaceId, savedWorkspaces]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = workspaceName.trim();
    if (trimmedName) {
      if (workspaceId) {
        // Update existing workspace
        setSavedWorkspaces(
          savedWorkspaces.map(w =>
            w.id === workspaceId ? { ...w, name: trimmedName } : w
          )
        );
      } else {
        // Create new workspace
        const newWorkspace: Workspace = {
          id: Date.now().toString(),
          name: trimmedName,
          // Add other necessary properties
        };
        setSavedWorkspaces([...savedWorkspaces, newWorkspace]);
      }
      onBack(); // Go back after saving or updating
    }
  }, [workspaceName, workspaceId, onBack, setSavedWorkspaces]);

  const handleNameChange = useLastCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkspaceName(e.target.value);
  });

  return (
    <div className={styles.container}>
      <button onClick={onBack} className={styles.backButton}>Back</button>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <input
            id="workspace-name"
            type="text"
            value={workspaceName}
            onChange={handleNameChange}
            placeholder="Workspace name"
            required
            className={styles.input}
          />
        </div>
        <button type="submit" className={styles.button}>{workspaceId ? 'Update' : 'Create'} Workspace</button>
      </form>
    </div>
  );
};

export default WorkspaceSettingsPage;
