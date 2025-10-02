import type { FC } from '../../../lib/teact/teact';
import { useState, useCallback, useEffect } from '../../../lib/teact/teact';
import { getGlobal, getActions } from '../../../global';
import styles from './WorkspaceSettingsPage.module.scss';

import { useWorkspaceStorage } from '../../../hooks/useWorkspaceStorage';
import { Workspace } from '../../../types';

interface OwnProps {
  onBack: () => void;
  workspaceId?: string;
}

const WorkspaceSettingsPage: FC<OwnProps> = ({
  onBack,
  workspaceId,
}) => {
  const global = getGlobal();
  const { setActiveChatFolder } = getActions();
  const chatFoldersById = global.chatFolders.byId;
  const orderedFolderIds = global.chatFolders.orderedIds;
  const folders = orderedFolderIds ? orderedFolderIds.map((id) => chatFoldersById[id]).filter(Boolean) : [];

  const [workspaceName, setWorkspaceName] = useState('');
  const [selectedFolderIds, setSelectedFolderIds] = useState<number[]>([]);
  const { savedWorkspaces, setSavedWorkspaces, setCurrentWorkspaceId } = useWorkspaceStorage();

  useEffect(() => {
    if (workspaceId) {
      const workspace = savedWorkspaces.find(w => w.id === workspaceId);
      if (workspace) {
        setWorkspaceName(workspace.name);
        setSelectedFolderIds(workspace.foldersIds || []);
      }
    }
  }, [workspaceId, savedWorkspaces]);

  const isFormValid = selectedFolderIds.length > 0 && workspaceName.trim() !== '';

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const trimmedName = workspaceName.trim();
    if (isFormValid) {
      if (workspaceId) {
        setSavedWorkspaces(
          savedWorkspaces.map(w =>
            w.id === workspaceId ? { ...w, name: trimmedName, foldersIds: selectedFolderIds } : w
          )
        );
      } else {
        const newWorkspace: Workspace = {
          id: Date.now().toString(),
          name: trimmedName,
          foldersIds: selectedFolderIds,
        };
        setSavedWorkspaces([...savedWorkspaces, newWorkspace]);
        setCurrentWorkspaceId(newWorkspace.id);
      }
      setActiveChatFolder({ activeChatFolder: 0 }, { forceOnHeavyAnimation: true });
      onBack();
    }
  }, [workspaceName, selectedFolderIds, workspaceId, onBack, setSavedWorkspaces, savedWorkspaces, isFormValid]);

  const handleNameChange = useCallback((e) => {
    setWorkspaceName(e.target.value);
  }, [setWorkspaceName]);

  const handleFolderSelect = useCallback((folderId: number) => {
    setSelectedFolderIds(prevIds =>
      prevIds.includes(folderId)
        ? prevIds.filter(id => id !== folderId)
        : [...prevIds, folderId]
    );
  }, [setSelectedFolderIds]);

  const handleDeleteWorkspace = useCallback(() => {
    setSavedWorkspaces(savedWorkspaces.filter(w => w.id !== workspaceId));
    setCurrentWorkspaceId('0');
    onBack();
  }, [workspaceId, setSavedWorkspaces, setCurrentWorkspaceId, onBack]);

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
          {workspaceId && (
            <button onClick={handleDeleteWorkspace} className={styles.deleteButton} aria-label="Delete workspace" title="Delete workspace">
              <i className="icon icon-delete" />
            </button>
          )}
        </div>
        <div className={styles.folderSelection}>
          <h3 className={styles.folderSelectionTitle}>Select folders:</h3>
          {folders.map((folder) => (
            <label key={folder.id} className={styles.folderCheckbox}>
              <input
                type="checkbox"
                checked={selectedFolderIds.includes(folder.id)}
                onChange={() => handleFolderSelect(folder.id)}
              />
              {folder.title.text}
            </label>
          ))}
        </div>
        <button 
          type="submit" 
          className={styles.button} 
          disabled={!isFormValid}
        >
          {workspaceId ? 'Update' : 'Create'} Workspace
        </button>
      </form>
    </div>
  );
};

export default WorkspaceSettingsPage;
