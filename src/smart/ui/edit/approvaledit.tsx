import { FormGroup } from '@blueprintjs/core';
import React, { useEffect, useMemo, useState } from 'react';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
import {
  EditorApproval,
  EditorModel,
  EditorRegistry,
} from '../../model/editormodel';
import { ModelWrapper } from '../../model/modelwrapper';
import {
  checkId,
  getModelAllRefs,
  getModelAllRegs,
  getModelAllRoles,
  removeSpace,
  updatePageElement,
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
} from '../../serialize/interface/supportinterface';
import { DescriptionItem } from '../common/description/fields';
import RoleSelector from './components/RoleSelector';
import RegistrySelector from './components/RegistrySelector';
import SimpleReferenceSelector from './components/ReferenceSelector';

interface CommonApprovalEditProps {
  onUpdateClick: () => void;
  editing: EditorApproval;
  setEditing: (x: EditorApproval) => void;
  model: EditorModel;
  onFullEditClick?: () => void;
  onDeleteClick?: () => void;
}

const EditApprovalPage: React.FC<{
  modelWrapper: ModelWrapper;
  setModel: (m: EditorModel) => void;
  id: string;
  closeDialog?: () => void;
  minimal?: boolean;
  onFullEditClick?: () => void;
  onDeleteClick?: () => void;
  setSelectedNode?: (id: string) => void;
}> = function ({
  modelWrapper,
  setModel,
  id,
  closeDialog,
  minimal = false,
  onFullEditClick,
  onDeleteClick,
  setSelectedNode,
}) {
  const model = modelWrapper.model;

  const approval = model.elements[id] as EditorApproval;

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
    const updated = save(id, editing, modelWrapper.page, model);
    if (updated !== null) {
      setModel({ ...updated });
      if (closeDialog !== undefined) {
        closeDialog();
      }
    }
    setHasChange(false);
  }

  function setEdit(x: EditorApproval) {
    setEditing(x);
    onChange();
  }

  function onChange() {
    if (!hasChange) {
      setHasChange(true);
    }
  }

  function saveOnExit() {
    setHasChange(hc => {
      if (hc) {
        setEditing(edit => {
          const updated = save(id, edit, modelWrapper.page, model);
          if (updated !== null) {
            setModel({ ...updated });
          }
          return edit;
        });
      }
      return false;
    });
  }

  function onNewID(id: string) {
    const oldid = approval.id;
    const mw = modelWrapper;
    const updated = save(
      oldid,
      { ...editing, id },
      modelWrapper.page,
      mw.model
    );
    if (updated !== null) {
      setModel({ ...updated });
    }
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
    onFullEditClick: fullEditClick,
    onDeleteClick,
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
    setEditing: setEdit,
    initID: approval.id,
    validTest: (id: string) =>
      id === approval.id || checkId(id, model.elements),
    onNewID,
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
  } = props;

  useEffect(() => saveOnExit, [approval]);

  return (
    <FormGroup>
      <EditPageButtons {...props} />
      <DescriptionItem label="Approval ID" value={editing.id} />
      <NormalTextField
        text="Approval Process Name"
        value={editing.name}
        onChange={x => setEditing({ ...editing, name: x })}
      />
      <NormalComboBox
        text="Modality"
        value={editing.modality}
        options={MODAILITYOPTIONS}
        onChange={x => setEditing({ ...editing, modality: x })}
      />
      <RoleSelector
        label="Actor"
        activeItem={editing.actor !== '' ? model.roles[editing.actor] : null}
        items={roleObjects}
        onItemSelect={x =>
          setEditing({ ...editing, actor: x !== null ? x.id : '' })
        }
      />
      <RoleSelector
        label="Approver"
        activeItem={
          editing.approver !== '' ? model.roles[editing.approver] : null
        }
        items={roleObjects}
        onItemSelect={x =>
          setEditing({ ...editing, approver: x !== null ? x.id : '' })
        }
      />
      <RegistrySelector
        label="Approval record registry"
        selected={editing.records}
        items={registryObjects}
        onItemSelect={x =>
          setEditing({
            ...editing,
            records: new Set([...editing.records, x.id]),
          })
        }
        onTagRemove={x => {
          editing.records = new Set([...editing.records].filter(s => x !== s));
          setEditing({ ...editing });
        }}
      />
      <SimpleReferenceSelector
        selected={editing.ref}
        items={refObjects}
        onItemSelect={x =>
          setEditing({ ...editing, ref: new Set([...editing.ref, x.id]) })
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
  }
> = function (props) {
  const { editing, setEditing, roles, regs, refs } = props;
  return (
    <MGDDisplayPane>
      <FormGroup>
        <EditPageButtons {...props} />
        <NormalTextField
          text="Approval ID"
          value={editing.id}
          onChange={x => setEditing({ ...editing, id: removeSpace(x) })}
        />
        <NormalTextField
          text="Approval Process Name"
          value={editing.name}
          onChange={x => setEditing({ ...editing, name: x })}
        />
        <NormalComboBox
          text="Modality"
          value={editing.modality}
          options={MODAILITYOPTIONS}
          onChange={x => setEditing({ ...editing, modality: x })}
        />
        <ReferenceSelector
          text="Actor"
          filterName="Actor filter"
          value={editing.actor}
          options={roles}
          update={x => setEditing({ ...editing, actor: roles[x] })}
        />
        <ReferenceSelector
          text="Approver"
          filterName="Approver filter"
          value={editing.approver}
          options={roles}
          update={x => setEditing({ ...editing, approver: roles[x] })}
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

function save(
  oldId: string,
  approval: EditorApproval,
  pageid: string,
  model: EditorModel
): EditorModel | null {
  if (oldId !== approval.id) {
    if (checkId(approval.id, model.elements)) {
      delete model.elements[oldId];
      const page = model.pages[pageid];
      updatePageElement(page, oldId, approval);
      model.elements[approval.id] = approval;
    } else {
      return null;
    }
  } else {
    model.elements[oldId] = approval;
  }
  return model;
}

export default EditApprovalPage;
