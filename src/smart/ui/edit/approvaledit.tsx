/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useState } from 'react';
import { useStoreActions } from 'react-flow-renderer';
import { EditorApproval, EditorModel } from '../../model/editormodel';
import { ModelWrapper } from '../../model/modelwrapper';
import {
  checkId,
  getModelAllRefs,
  getModelAllRegs,
  getModelAllRolesWithEmpty,
  removeSpace,
  updatePageElement,
} from '../../utils/commonfunctions';
import { MODAILITYOPTIONS } from '../../utils/constants';
import {
  MultiReferenceSelector,
  NormalComboBox,
  NormalTextField,
  ReferenceSelector,
} from '../common/fields';
import { EditPageButtons } from './commons';

const EditApprovalPage: React.FC<{
  modelwrapper: ModelWrapper;
  setModel: (m: EditorModel) => void;
  id: string;
  closeDialog: () => void;
}> = function ({ modelwrapper, setModel, id, closeDialog }) {
  const setElm = useStoreActions(act => act.setSelectedElements);

  const model = modelwrapper.model;

  const approval = model.elements[id] as EditorApproval;

  const [editing, setEditing] = useState<EditorApproval>({ ...approval });

  const roles = getModelAllRolesWithEmpty(model);
  const regs = getModelAllRegs(model);
  const refs = getModelAllRefs(model);

  function onUpdateClick() {
    const updated = save(id, editing, modelwrapper.page, model);
    if (updated !== null) {
      setElm([]);
      setModel({ ...updated });
      closeDialog();
    }
  }

  return (
    <>
      <EditPageButtons
        onUpdateClick={onUpdateClick}
        onCancelClick={closeDialog}
      />
      <NormalTextField
        key="field#approvalID"
        text="Approval ID"
        value={editing.id}
        onChange={x => setEditing({ ...editing, id: removeSpace(x) })}
      />
      <NormalTextField
        key="field#approvalName"
        text="Approval Process Name"
        value={editing.name}
        onChange={x => setEditing({ ...editing, name: x })}
      />
      <NormalComboBox
        key="field#approvalModality"
        text="Modality"
        value={editing.modality}
        options={MODAILITYOPTIONS}
        onChange={x => setEditing({ ...editing, modality: x })}
      />
      <ReferenceSelector
        key="field#ApprovalActor"
        text="Actor"
        filterName="Actor filter"
        value={editing.actor}
        options={roles}
        update={x => setEditing({ ...editing, actor: roles[x] })}
      />
      <ReferenceSelector
        key="field#ApprovalApprover"
        text="Approver"
        filterName="Approver filter"
        value={editing.approver}
        options={roles}
        update={x => setEditing({ ...editing, approver: roles[x] })}
      />
      <MultiReferenceSelector
        key="field#recordSelector"
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
        key="field#refSelector"
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
    </>
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
