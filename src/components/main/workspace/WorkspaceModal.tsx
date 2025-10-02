import type { FC } from '../../../lib/teact/teact';
import { useState, useCallback, useEffect } from '../../../lib/teact/teact';
import { getGlobal, getActions } from '../../../global';

import { useWorkspaceStorage } from '../../../hooks/useWorkspaceStorage';
import { Workspace } from '../../../types';
import Button from '../../ui/Button';
import InputText from '../../ui/InputText';
import Checkbox from '../../ui/Checkbox';
import Icon from '../../common/icons/Icon';
import Modal from '../../ui/Modal';
import useLang from '../../../hooks/useLang';

import './WorkspaceModal.scss';

type OwnProps = {
  isOpen: boolean;
  workspaceId?: string;
};

const WorkspaceModal: FC<OwnProps> = ({
  isOpen,
  workspaceId,
}) => {
  const global = getGlobal();
  const { setActiveChatFolder, closeWorkspaceCreator } = getActions();

  const chatFoldersById = global.chatFolders.byId;
  const orderedFolderIds = global.chatFolders.orderedIds;
  const folders = orderedFolderIds ? orderedFolderIds.map((id) => chatFoldersById[id]).filter(Boolean) : [];

  const [workspaceName, setWorkspaceName] = useState('');
  const [selectedFolderIds, setSelectedFolderIds] = useState<number[]>([]);
  const { savedWorkspaces, setSavedWorkspaces, setCurrentWorkspaceId } = useWorkspaceStorage();

  const lang = useLang();
  const currentWorkspaceId = workspaceId;

  useEffect(() => {
    if (currentWorkspaceId) {
      const workspace = savedWorkspaces.find(w => w.id === currentWorkspaceId);
      if (workspace) {
        setWorkspaceName(workspace.name);
        setSelectedFolderIds(workspace.foldersIds || []);
      }
    } else {
      setWorkspaceName('');
      setSelectedFolderIds([]);
    }
  }, [currentWorkspaceId, savedWorkspaces]);

  const isFormValid = selectedFolderIds.length > 0 && workspaceName.trim() !== '';

  const handleSubmit = useCallback(e => {
    e.preventDefault();
    const trimmedName = workspaceName.trim();

    if (isFormValid) {
      if (currentWorkspaceId) {
        setSavedWorkspaces(
          savedWorkspaces.map(w =>
            w.id === currentWorkspaceId ? { ...w, name: trimmedName, foldersIds: selectedFolderIds } : w
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
      closeWorkspaceCreator();
    }
  }, [workspaceName, selectedFolderIds, currentWorkspaceId, setSavedWorkspaces, savedWorkspaces, isFormValid, setActiveChatFolder, closeWorkspaceCreator]);

  const handleNameChange = useCallback(e => {
    setWorkspaceName(e.target.value);
  }, []);

  const handleFolderSelect = useCallback((folderId: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFolderIds(prevIds =>
      prevIds.includes(folderId)
        ? prevIds.filter(id => id !== folderId)
        : [...prevIds, folderId]
    );
  }, []);

  const handleDeleteWorkspace = useCallback(() => {
    if (currentWorkspaceId) {
      setSavedWorkspaces(savedWorkspaces.filter(w => w.id !== currentWorkspaceId));
      setCurrentWorkspaceId('0');
      closeWorkspaceCreator();
    }
  }, [currentWorkspaceId, savedWorkspaces, setSavedWorkspaces, setCurrentWorkspaceId, closeWorkspaceCreator]);

  const handleClose = useCallback(() => {
    closeWorkspaceCreator();
  }, [closeWorkspaceCreator]);

  const renderHeader = useCallback(() => {
    const modalTitle = currentWorkspaceId ? 'Edit Workspace' : 'Create Workspace';
    return (
      <div className="modal-header-condensed">
        <Button round color="translucent" size="smaller" ariaLabel={lang('Cancel')} onClick={handleClose}>
          <Icon name="close" />
        </Button>
        <div className="modal-title">{modalTitle}</div>
        <Button
          color="primary"
          size="smaller"
          className="modal-action-button"
          onClick={handleSubmit}
          disabled={!isFormValid}
        >
          {currentWorkspaceId ? 'Save' : 'Create'}
        </Button>
      </div>
    );
  }, [currentWorkspaceId, isFormValid, handleSubmit, handleClose, lang]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} header={renderHeader()} className="WorkspaceModal">
      <div className="workspace-form">
        <InputText
          id="workspace-name"
          value={workspaceName}
          onChange={handleNameChange}
          label="Workspace name"
        />
        
        <div className="workspace-folder-selection">
          <h3 className="workspace-folder-selection-title">Select folders:</h3>
          {folders.map((folder) => (
            <Checkbox
              key={folder.id}
              label={folder.title.text}
              checked={selectedFolderIds.includes(folder.id)}
              onChange={handleFolderSelect(folder.id)}
            />
          ))}
        </div>

        {currentWorkspaceId && (
          <Button color="danger" onClick={handleDeleteWorkspace}>Delete workspace</Button>
        )}
      </div>
    </Modal>
  );
};

export default WorkspaceModal;