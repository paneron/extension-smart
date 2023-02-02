import { FormGroup } from '@blueprintjs/core';
import React, { useEffect, useMemo, useState } from 'react';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
import {
  EditorApproval,
  EditorModel,
  EditorRegistry,
} from '../../model/editormodel';
import {
  checkId,
  getModelAllRefs,
  getModelAllRegs,
  getModelAllRoles,
  removeSpace,
} from '../../utils/ModelFunctions';
import { MODAILITYOPTIONS } from '../../utils/constants';
import {
  MultiReferenceSelector,
  NormalComboBox,
  NormalTextField,
  ReferenceSelector,
} from '../common/fields';
import { EditPageButtons } from './commons';
import {
  MMELReference,
  MMELRole,
} from '@paneron/libmmel/interface/supportinterface';
import { DescriptionItem } from '../common/description/fields';
import RoleSelector from './components/RoleSelector';
import RegistrySelector from './components/RegistrySelector';
import SimpleReferenceSelector from './components/ReferenceSelector';
import { ModelAction } from '../../model/editor/model';
import PopoverChangeIDButton from '../popover/PopoverChangeIDButton';
import { editElmCommand } from '../../model/editor/commands/elements';

interface CommonApprovalEditProps {
  onUpdateClick: () => void;
  editing: EditorApproval;
  setEditing: (x: EditorApproval) => void;
  model: EditorModel;
  onFullEditClick?: () => void;
  onDeleteClick?: () => void;
  setUndoListener: (x: (() => void) | undefined) => void;
}

const EditApprovalPage: React.FC<{
  model: EditorModel;
  act: (x: ModelAction) => void;
  approval: EditorApproval;
  closeDialog?: () => void;
  minimal?: boolean;
  onFullEditClick?: () => void;
  onDeleteClick?: () => void;
  setSelectedNode?: (id: string) => void;
  setUndoListener: (x: (() => void) | undefined) => void;
  clearRedo: () => void;
}> = function ({
  model,
  act,
  approval,
  closeDialog,
  minimal = false,
  onFullEditClick,
  onDeleteClick,
  setSelectedNode,
  setUndoListener,
  clearRedo,
}) {
  const [editing, setEditing] = useState<EditorApproval>({ ...approval });
  const [hasChange, setHasChange] = useState<boolean>(false);

  const roleObjects = useMemo(() => getModelAllRoles(model), [model]);
  const roles = useMemo(
    () => ['', ...roleObjects.map(r => r.id)],
    [roleObjects]
  );
  const registryObjects = useMemo(() => getModelAllRegs(model), [model]);
  const regs = useMemo(() => registryObjects.map(r => r.id), [registryObjects]);
  const refObjects = useMemo(() => getModelAllRefs(model), [model]);
  const refs = useMemo(() => refObjects.map(r => r.id), [refObjects]);

  function onUpdateClick() {
    act(editElmCommand(approval.id, editing));
    if (closeDialog) {
      closeDialog();
    }
    setHasChange(false);
    if (setSelectedNode !== undefined && approval.id !== editing.id) {
      setSelectedNode(editing.id);
    }
  }

  function setEdit(x: EditorApproval) {
    setEditing(x);
    onChange();
  }

  function onChange() {
    if (!hasChange) {
      clearRedo();
      setHasChange(true);
    }
  }

  function saveOnExit() {
    setHasChange(hc => {
      if (hc) {
        setEditing(edit => {
          act(editElmCommand(approval.id, edit));
          return edit;
        });
      }
      return false;
    });
  }

  function onNewID(id: string) {
    act(editElmCommand(approval.id, { ...editing, id }));
    setHasChange(false);
    if (setSelectedNode !== undefined) {
      setSelectedNode(id);
    }
  }

  const fullEditClick =
    onFullEditClick !== undefined
      ? function () {
        if (hasChange) {
          onUpdateClick();
        }
        onFullEditClick();
      }
      : undefined;

  const commonProps = {
    onUpdateClick,
    editing,
    setEditing,
    model,
    onFullEditClick : fullEditClick,
    onDeleteClick,
    setUndoListener,
  };

  const fullEditProps = {
    closeDialog,
    roles,
    regs,
    refs,
  };

  const quickEditProps = {
    roleObjects,
    registryObjects,
    refObjects,
    saveOnExit,
    approval,
    setEditing : setEdit,
    initID     : approval.id,
    validTest  : (id: string) =>
      id === approval.id || checkId(id, model.elements),
    onNewID,
    setHasChange,
  };

  useEffect(() => setEditing(approval), [approval]);

  return minimal ? (
    <QuickVersionEdit {...commonProps} {...quickEditProps} />
  ) : (
    <FullVersionEdit {...commonProps} {...fullEditProps} />
  );
};

const QuickVersionEdit: React.FC<
  CommonApprovalEditProps & {
    roleObjects: MMELRole[];
    registryObjects: EditorRegistry[];
    refObjects: MMELReference[];
    saveOnExit: () => void;
    approval: EditorApproval;
    onNewID: (id: string) => void;
    setUndoListener: (x: (() => void) | undefined) => void;
    setHasChange: (x: boolean) => void;
  }
> = function (props) {
  const {
    editing,
    setEditing,
    roleObjects,
    model,
    registryObjects,
    refObjects,
    saveOnExit,
    approval,
    onNewID,
    setUndoListener,
    setHasChange,
  } = props;

  function idTest(id: string) {
    return id === approval.id || checkId(id, model.elements);
  }

  const idButton = (
    <PopoverChangeIDButton
      initValue={editing.id}
      validTest={idTest}
      save={onNewID}
    />
  );

  useEffect(() => {
    setUndoListener(() => setHasChange(false));
    return () => {
      setUndoListener(undefined);
      saveOnExit();
    };
  }, [approval]);

  return (
    <FormGroup>
      <EditPageButtons {...props} />
      <DescriptionItem
        label="Approval ID"
        value={editing.id}
        extend={idButton}
      />
      <NormalTextField
        text="Approval Process Name"
        value={editing.name}
        onChange={x => setEditing({ ...editing, name : x })}
      />
      <NormalComboBox
        text="Modality"
        value={editing.modality}
        options={MODAILITYOPTIONS}
        onChange={x => setEditing({ ...editing, modality : x })}
      />
      <RoleSelector
        label="Actor"
        activeItem={editing.actor !== '' ? model.roles[editing.actor] : null}
        items={roleObjects}
        onItemSelect={x =>
          setEditing({ ...editing, actor : x !== null ? x.id : '' })
        }
      />
      <RoleSelector
        label="Approver"
        activeItem={
          editing.approver !== '' ? model.roles[editing.approver] : null
        }
        items={roleObjects}
        onItemSelect={x =>
          setEditing({ ...editing, approver : x !== null ? x.id : '' })
        }
      />
      <RegistrySelector
        label="Approval record registry"
        selected={editing.records}
        items={registryObjects}
        onItemSelect={x =>
          setEditing({
            ...editing,
            records : new Set([...editing.records, x.id]),
          })
        }
        onTagRemove={x => {
          const newSet = new Set([...editing.records].filter(s => x !== s));
          setEditing({ ...editing, records : newSet });
        }}
      />
      <SimpleReferenceSelector
        selected={editing.ref}
        items={refObjects}
        onItemSelect={x =>
          setEditing({ ...editing, ref : new Set([...editing.ref, x.id]) })
        }
        onTagRemove={x => {
          editing.ref = new Set([...editing.ref].filter(s => x !== s));
          setEditing({ ...editing });
        }}
      />
    </FormGroup>
  );
};

const FullVersionEdit: React.FC<
  CommonApprovalEditProps & {
    closeDialog?: () => void;
    roles: string[];
    regs: string[];
    refs: string[];
    setUndoListener: (x: (() => void) | undefined) => void;
  }
> = function (props) {
  const {
    editing,
    setEditing,
    roles,
    regs,
    refs,
    closeDialog,
    setUndoListener,
  } = props;

  useEffect(() => {
    setUndoListener(() => closeDialog && closeDialog());
    return () => {
      setUndoListener(undefined);
    };
  }, []);

  return (
    <MGDDisplayPane>
      <FormGroup>
        <EditPageButtons {...props} />
        <NormalTextField
          text="Approval ID"
          value={editing.id}
          onChange={x => setEditing({ ...editing, id : removeSpace(x) })}
        />
        <NormalTextField
          text="Approval Process Name"
          value={editing.name}
          onChange={x => setEditing({ ...editing, name : x })}
        />
        <NormalComboBox
          text="Modality"
          value={editing.modality}
          options={MODAILITYOPTIONS}
          onChange={x => setEditing({ ...editing, modality : x })}
        />
        <ReferenceSelector
          text="Actor"
          filterName="Actor filter"
          value={editing.actor}
          options={roles}
          update={x => setEditing({ ...editing, actor : roles[x] })}
        />
        <ReferenceSelector
          text="Approver"
          filterName="Approver filter"
          value={editing.approver}
          options={roles}
          update={x => setEditing({ ...editing, approver : roles[x] })}
        />
        <MultiReferenceSelector
          text="Approval record registry"
          options={regs}
          values={editing.records}
          filterName="Registry filter"
          add={x => {
            editing.records = new Set([...editing.records, ...x]);
            setEditing({ ...editing });
          }}
          remove={x => {
            editing.records = new Set(
              [...editing.records].filter(s => !x.has(s))
            );
            setEditing({ ...editing });
          }}
        />
        <MultiReferenceSelector
          text="Reference"
          options={refs}
          values={editing.ref}
          filterName="Reference filter"
          add={x => {
            editing.ref = new Set([...editing.ref, ...x]);
            setEditing({ ...editing });
          }}
          remove={x => {
            editing.ref = new Set([...editing.ref].filter(s => !x.has(s)));
            setEditing({ ...editing });
          }}
        />
      </FormGroup>
    </MGDDisplayPane>
  );
};

export default EditApprovalPage;
