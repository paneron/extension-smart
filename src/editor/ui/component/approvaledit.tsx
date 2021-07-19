/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import React from 'react';
import { MODAILITYOPTIONS } from '../../runtime/idManager';
import { DataType } from '../../serialize/interface/baseinterface';
import { MMELApproval } from '../../serialize/interface/processinterface';
import { MMELRole } from '../../serialize/interface/supportinterface';
import { IApproval } from '../interface/datainterface';
import { StateMan } from '../interface/state';
import { functionCollection } from '../util/function';
import { MyTopRightButtons } from './unit/closebutton';
import NormalComboBox from './unit/combobox';
import {
  MultiReferenceSelector,
  ReferenceSelector,
} from './unit/referenceselect';
import NormalTextField from './unit/textfield';

const EditApprovalPage: React.FC<StateMan> = (sm: StateMan) => {
  const close = () => {
    sm.state.viewapproval = null;
    sm.setState(sm.state);
  };

  const approval = sm.state.viewapproval;
  const model = sm.state.modelWrapper.model;
  const roles: Array<string> = [''];
  const regs: Array<string> = [];
  const refs: Array<string> = [];
  if (approval !== null) {
    model.roles.map(r => roles.push(r.id));
    model.regs.map(r => regs.push(r.id));
    model.refs.map(r => refs.push(r.id));
  }

  const setPID = (x: string) => {
    if (approval !== null) {
      approval.id = x.replaceAll(/\s+/g, '');
      sm.setState({ ...sm.state });
    }
  };

  const setAPPName = (x: string) => {
    if (approval !== null) {
      approval.name = x;
      sm.setState({ ...sm.state });
    }
  };

  const setAPPModality = (x: string) => {
    if (approval !== null) {
      approval.modality = x;
      sm.setState({ ...sm.state });
    }
  };

  const setActor = (x: number) => {
    if (approval !== null) {
      approval.actor = roles[x];
      sm.setState({ ...sm.state });
    }
  };

  const setAppprover = (x: number) => {
    if (approval !== null) {
      approval.approver = roles[x];
      sm.setState({ ...sm.state });
    }
  };

  const recordAdd = (x: Array<string>) => {
    if (approval !== null) {
      approval.records = approval.records.concat(x);
      sm.setState({ ...sm.state });
    }
  };

  const recordRemove = (x: Array<string>) => {
    x.map(r => {
      if (approval !== null) {
        const index = approval.records.indexOf(r);
        if (index !== -1) {
          approval.records.splice(index, 1);
        }
      }
    });
    sm.setState({ ...sm.state });
  };

  const refAdd = (x: Array<string>) => {
    if (approval !== null) {
      approval.ref = approval.ref.concat(x);
      sm.setState({ ...sm.state });
    }
  };

  const refRemove = (x: Array<string>) => {
    x.map(r => {
      if (approval !== null) {
        const index = approval.ref.indexOf(r);
        if (index !== -1) {
          approval.ref.splice(index, 1);
        }
      }
    });
    sm.setState({ ...sm.state });
  };

  const elms: Array<JSX.Element> = [];
  if (approval !== null) {
    elms.push(
      <NormalTextField
        key="field#approvalID"
        text="Approval ID"
        value={approval.id}
        update={setPID}
      />
    );
    elms.push(
      <NormalTextField
        key="field#approvalName"
        text="Approval Process Name"
        value={approval.name}
        update={setAPPName}
      />
    );
    elms.push(
      <NormalComboBox
        key="field#approvalModality"
        text="Modality"
        value={approval.modality}
        options={MODAILITYOPTIONS}
        update={setAPPModality}
      />
    );
    elms.push(
      <ReferenceSelector
        key="field#ApprovalActor"
        text="Actor"
        filterName="Actor filter"
        value={approval.actor}
        options={roles}
        update={setActor}
      />
    );
    elms.push(
      <ReferenceSelector
        key="field#ApprovalApprover"
        text="Approver"
        filterName="Approver filter"
        value={approval.approver}
        options={roles}
        update={setAppprover}
      />
    );
    elms.push(
      <MultiReferenceSelector
        key="field#recordSelector"
        text="Approval record registry"
        options={regs}
        values={approval.records}
        filterName="Registry filter"
        add={recordAdd}
        remove={recordRemove}
      />
    );
    elms.push(
      <MultiReferenceSelector
        key="field#refSelector"
        text="Reference"
        options={refs}
        values={approval.ref}
        filterName="Reference filter"
        add={refAdd}
        remove={refRemove}
      />
    );
    return (
      <DisplayPane
        style={{ display: sm.state.viewapproval !== null ? 'inline' : 'none' }}
      >
        <MyTopRightButtons onClick={() => close()}>X</MyTopRightButtons>
        {elms}
        <div>
          <button
            key="processedit#saveButton"
            onClick={() => save(sm, sm.state.approval, approval)}
          >
            {' '}
            Save{' '}
          </button>
          <button key="processedit#cancelButton" onClick={() => close()}>
            {' '}
            Cancel{' '}
          </button>
        </div>
      </DisplayPane>
    );
  }
  return <></>;
};

function save(
  sm: StateMan,
  oldValue: MMELApproval | null,
  newValue: IApproval | null
) {
  if (oldValue !== null && newValue !== null) {
    const idreg = sm.state.modelWrapper.idman;
    if (oldValue.id !== newValue.id) {
      if (newValue.id === '') {
        alert('ID is empty');
        return;
      }
      if (idreg.nodes.has(newValue.id)) {
        alert('New ID already exists');
        return;
      }
      idreg.nodes.delete(oldValue.id);
      idreg.nodes.set(newValue.id, oldValue);
      functionCollection.renameLayoutItem(oldValue.id, newValue.id);
      oldValue.id = newValue.id;
    }
    oldValue.name = newValue.name;
    oldValue.modality = newValue.modality;
    if (newValue.actor === '') {
      oldValue.actor = null;
    } else {
      const obj = idreg.roles.get(newValue.actor);
      if (obj?.datatype === DataType.ROLE) {
        oldValue.actor = obj as MMELRole;
      } else {
        console.error('Role not found: ', newValue.actor);
      }
    }
    if (newValue.approver === '') {
      oldValue.approver = null;
    } else {
      const approver = idreg.roles.get(newValue.approver);
      if (approver?.datatype === DataType.ROLE) {
        oldValue.approver = approver as MMELRole;
      } else {
        console.error('Role not found: ', newValue.approver);
      }
    }
    oldValue.records = [];
    newValue.records.map(x => {
      const data = idreg.regs.get(x);
      if (data !== undefined) {
        oldValue.records.push(data);
      } else {
        console.error('Data not found: ', x);
      }
    });
    oldValue.ref = [];
    newValue.ref.map(x => {
      const data = idreg.refs.get(x);
      if (data !== undefined) {
        oldValue.ref.push(data);
      } else {
        console.error('Reference not found: ', x);
      }
    });
    sm.state.viewapproval = null;
    sm.state.approval = null;
    sm.setState(sm.state);
  }
}

const DisplayPane = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  bottom: 0;
  left: 0;
  background: white;
  font-size: 12px;
  overflow-y: auto;
  border-style: solid;
  z-index: 110;
`;

export default EditApprovalPage;
