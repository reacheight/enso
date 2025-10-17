import type { FC } from '../../../lib/teact/teact';
import { useState, useCallback, useEffect } from '../../../lib/teact/teact';
import { getGlobal, getActions } from '../../../global';

import type { Workspace } from '../../../types';
import {
  selectWorkspaceById,
  EVERYTHING_WORKSPACE_ID,
} from '../../../global/selectors/workspaces';
import useSelector from '../../../hooks/data/useSelector';
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
  const {
    setActiveChatFolder,
    closeWorkspaceCreator,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    setCurrentWorkspace,
  } = getActions();

  const chatFoldersById = global.chatFolders.byId;
  const orderedFolderIds = global.chatFolders.orderedIds;
  const folders = orderedFolderIds ? orderedFolderIds.map((id) => chatFoldersById[id]).filter(Boolean) : [];

  const [workspaceName, setWorkspaceName] = useState('');
  const [selectedFolderIds, setSelectedFolderIds] = useState<number[]>([]);
  
  const editingWorkspace = useSelector((state) => 
    workspaceId ? selectWorkspaceById(state, workspaceId) : undefined
  );

  const lang = useLang();
  const currentWorkspaceId = workspaceId;

  useEffect(() => {
    if (editingWorkspace) {
      setWorkspaceName(editingWorkspace.name);
      setSelectedFolderIds(editingWorkspace.foldersIds || []);
    } else {
      setWorkspaceName('');
      setSelectedFolderIds([]);
    }
  }, [editingWorkspace]);

  const isFormValid = selectedFolderIds.length > 0 && workspaceName.trim() !== '';

  const handleSubmit = useCallback(e => {
    e.preventDefault();
    const trimmedName = workspaceName.trim();

    if (isFormValid) {
      if (currentWorkspaceId) {
        updateWorkspace({
          workspace: {
            id: currentWorkspaceId,
            name: trimmedName,
            foldersIds: selectedFolderIds,
          },
        });
      } else {
        const newWorkspace: Workspace = {
          id: Date.now().toString(),
          name: trimmedName,
          foldersIds: selectedFolderIds,
        };
        createWorkspace({ workspace: newWorkspace });
        setCurrentWorkspace({ workspaceId: newWorkspace.id });
      }

      setActiveChatFolder({ activeChatFolder: 0 }, { forceOnHeavyAnimation: true });
      closeWorkspaceCreator();
    }
  }, [
    workspaceName,
    selectedFolderIds,
    currentWorkspaceId,
    isFormValid,
    createWorkspace,
    updateWorkspace,
    setCurrentWorkspace,
    setActiveChatFolder,
    closeWorkspaceCreator,
  ]);

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
      deleteWorkspace({ workspaceId: currentWorkspaceId });
      setCurrentWorkspace({ workspaceId: EVERYTHING_WORKSPACE_ID });
      closeWorkspaceCreator();
    }
  }, [currentWorkspaceId, deleteWorkspace, setCurrentWorkspace, closeWorkspaceCreator]);

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