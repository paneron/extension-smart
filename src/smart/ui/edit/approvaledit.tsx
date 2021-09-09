/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { FormGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React, { useState } from 'react';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
import { EditorApproval, EditorModel } from '../../model/editormodel';
import { ModelWrapper } from '../../model/modelwrapper';
import {
  checkId,
  getModelAllRefs,
  getModelAllRegs,
  getModelAllRolesWithEmpty,
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

const EditApprovalPage: React.FC<{
  modelwrapper: ModelWrapper;
  setModel: (m: EditorModel) => void;
  id: string;
  closeDialog: () => void;
}> = function ({ modelwrapper, setModel, id, closeDialog }) {
  const model = modelwrapper.model;

  const approval = model.elements[id] as EditorApproval;

  const [editing, setEditing] = useState<EditorApproval>({ ...approval });

  const roles = getModelAllRolesWithEmpty(model);
  const regs = getModelAllRegs(model);
  const refs = getModelAllRefs(model);

  function onUpdateClick() {
    const updated = save(id, editing, modelwrapper.page, model);
    if (updated !== null) {
      setModel({ ...updated });
      closeDialog();
    }
  }

  return (
    <MGDDisplayPane>
      <FormGroup>
        <EditPageButtons
          onUpdateClick={onUpdateClick}
          onCancelClick={closeDialog}
        />
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
