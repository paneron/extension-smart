/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import React, { useState } from 'react';
import { MODAILITYOPTIONS } from '../../runtime/idManager';
import { MMELFactory } from '../../runtime/modelComponentCreator';
import { DataType } from '../../serialize/interface/baseinterface';
import { MMELProcess } from '../../serialize/interface/processinterface';
import { MMELRole } from '../../serialize/interface/supportinterface';
import { IProcess, IProvision } from '../interface/datainterface';
import { StateMan } from '../interface/state';
import { Cleaner } from '../util/cleaner';
import { functionCollection } from '../util/function';
import { MeasureHandler } from './handle/measurecheckhandler';
import { ProvisionHandler } from './handle/provisionhandler';
import { MyTopRightButtons } from './unit/closebutton';
import NormalComboBox from './unit/combobox';
import ItemAddPane from './unit/itemadd';
import ItemUpdatePane from './unit/itemupdate';
import ListManagerPane from './unit/listmanage';
import {
  MultiReferenceSelector,
  ReferenceSelector,
} from './unit/referenceselect';
import NormalTextField from './unit/textfield';

const EditProcessPage: React.FC<StateMan> = (sm: StateMan) => {
  const [isAdd, setAddMode] = useState(false);
  const [isUpdate, setUpdateMode] = useState(false);
  const [oldValue, setOldProvision] = useState<IProvision | null>(null);
  const [data, setData] = useState<IProvision>({
    modality: '',
    condition: '',
    ref: [],
  });

  const [isMAdd, setMAddMode] = useState(false);
  const [isMUpdate, setMUpdateMode] = useState(false);
  const [oldIndex, setOldIndex] = useState<number | null>(null);
  const [mdata, setMData] = useState<string>('');

  const close = () => {
    sm.state.viewprocess = null;
    sm.setState(sm.state);
  };

  const process = sm.state.viewprocess;
  const model = sm.state.modelWrapper.model;
  const roles: Array<string> = [''];
  const regs: Array<string> = [];
  if (process !== null) {
    model.roles.map(r => roles.push(r.id));
    model.regs.map(r => regs.push(r.id));
  }

  const setPID = (x: string) => {
    if (process !== null) {
      process.id = x.replaceAll(/\s+/g, '');
      sm.setState({ ...sm.state });
    }
  };

  const setPName = (x: string) => {
    if (process !== null) {
      process.name = x;
      sm.setState({ ...sm.state });
    }
  };

  const setPModality = (x: string) => {
    if (process !== null) {
      process.modality = x;
      sm.setState({ ...sm.state });
    }
  };

  const setPStart = (x: string) => {
    if (process !== null) {
      process.start = x === 'YES';
      sm.setState({ ...sm.state });
    }
  };

  const setActor = (x: number) => {
    if (process !== null) {
      process.actor = roles[x];
      sm.setState({ ...sm.state });
    }
  };

  const inputAdd = (x: Array<string>) => {
    if (process !== null) {
      process.input = process.input.concat(x);
      sm.setState({ ...sm.state });
    }
  };

  const inputRemove = (x: Array<string>) => {
    x.map(r => {
      if (process !== null) {
        const index = process.input.indexOf(r);
        if (index !== -1) {
          process.input.splice(index, 1);
        }
      }
    });
    sm.setState({ ...sm.state });
  };

  const outputAdd = (x: Array<string>) => {
    if (process !== null) {
      process.output = process.output.concat(x);
      sm.setState({ ...sm.state });
    }
  };

  const outputRemove = (x: Array<string>) => {
    x.map(r => {
      if (process !== null) {
        const index = process.output.indexOf(r);
        if (index !== -1) {
          process.output.splice(index, 1);
        }
      }
    });
    sm.setState({ ...sm.state });
  };

  const forceUpdate = () => {
    sm.setState({ ...sm.state });
  };

  const elms: Array<JSX.Element> = [];
  if (process !== null) {
    elms.push(
      <NormalTextField
        key="field#processID"
        text="Process ID"
        value={process.id}
        update={setPID}
      />
    );
    elms.push(
      <NormalTextField
        key="field#processName"
        text="Process Name"
        value={process.name}
        update={setPName}
      />
    );
    elms.push(
      <NormalComboBox
        key="field#processModality"
        text="Modality"
        value={process.modality}
        options={MODAILITYOPTIONS}
        update={setPModality}
      />
    );
    elms.push(
      <NormalComboBox
        key="field#processStart"
        text="Subprocess"
        value={process.start ? 'YES' : 'NO'}
        options={['YES', 'NO']}
        update={setPStart}
      />
    );
    elms.push(
      <ReferenceSelector
        key="field#Actor"
        text="Actor"
        filterName="Actor filter"
        value={process.actor}
        options={roles}
        update={setActor}
      />
    );
    elms.push(
      <MultiReferenceSelector
        key="field#inputSelector"
        text="Input data registry"
        options={regs}
        values={process.input}
        filterName="Input Registry filter"
        add={inputAdd}
        remove={inputRemove}
      />
    );
    elms.push(
      <MultiReferenceSelector
        key="field#outputSelector"
        text="Output data registry"
        options={regs}
        values={process.output}
        filterName="Output Registry filter"
        add={outputAdd}
        remove={outputRemove}
      />
    );
    const handle = new ProvisionHandler(
      model,
      process,
      oldValue,
      setAddMode,
      setUpdateMode,
      setOldProvision,
      forceUpdate,
      data,
      setData
    );
    const mhandle = new MeasureHandler(
      process,
      oldIndex,
      setMAddMode,
      setMUpdateMode,
      setOldIndex,
      forceUpdate,
      mdata,
      setMData
    );
    return (
      <DisplayPane
        style={{ display: sm.state.viewprocess !== null ? 'inline' : 'none' }}
      >
        <MyTopRightButtons onClick={() => close()}>X</MyTopRightButtons>
        {elms}
        <DisplayContainer>
          <div style={{ display: !isAdd && !isUpdate ? 'inline' : 'none' }}>
            <ListManagerPane {...handle} />
          </div>
          <div style={{ display: isAdd ? 'inline' : 'none' }}>
            <ItemAddPane {...handle} />
          </div>
          <div style={{ display: isUpdate ? 'inline' : 'none' }}>
            <ItemUpdatePane {...handle} />
          </div>
        </DisplayContainer>
        <DisplayContainer>
          <div style={{ display: !isMAdd && !isMUpdate ? 'inline' : 'none' }}>
            <ListManagerPane {...mhandle} />
          </div>
          <div style={{ display: isMAdd ? 'inline' : 'none' }}>
            <ItemAddPane {...mhandle} />
          </div>
          <div style={{ display: isMUpdate ? 'inline' : 'none' }}>
            <ItemUpdatePane {...mhandle} />
          </div>
        </DisplayContainer>
        <div>
          <button
            key="processedit#saveButton"
            onClick={() => save(sm, sm.state.process, process)}
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
  oldValue: MMELProcess | null,
  newValue: IProcess | null
) {
  if (oldValue !== null && newValue !== null) {
    const model = sm.state.modelWrapper.model;
    const idreg = sm.state.modelWrapper.idman;
    const mw = sm.state.modelWrapper;
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
      const actor = idreg.roles.get(newValue.actor);
      if (actor?.datatype === DataType.ROLE) {
        oldValue.actor = actor as MMELRole;
      } else {
        console.error('Role not found: ', newValue.actor);
      }
    }
    oldValue.input = [];
    newValue.input.map(x => {
      const data = idreg.regs.get(x);
      if (data !== undefined) {
        oldValue.input.push(data);
      } else {
        console.error('Data not found: ', x);
      }
    });
    oldValue.output = [];
    newValue.output.map(x => {
      const data = idreg.regs.get(x);
      if (data !== undefined) {
        oldValue.output.push(data);
      } else {
        console.error('Data not found: ', x);
      }
    });
    Cleaner.cleanProvisions(oldValue);
    newValue.provision.map(p => {
      const id = idreg.findProvisionID('Provision');
      const pro = MMELFactory.createProvision(id);
      pro.condition = p.condition;
      pro.modality = p.modality;
      p.ref.map(r => {
        const ref = idreg.refs.get(r);
        if (ref === undefined) {
          console.error('Reference not found: ', r);
        } else {
          pro.ref.push(ref);
        }
      });
      model.provisions.push(pro);
      idreg.provisions.set(pro.id, pro);
      oldValue.provision.push(pro);
    });
    oldValue.measure = newValue.measure;
    if (oldValue.page !== null && !newValue.start) {
      // remove subprocess
      Cleaner.killPage(oldValue.page);
      oldValue.page = null;
    } else if (oldValue.page === null && newValue.start) {
      // add subprocess
      const pg = MMELFactory.createSubprocess(idreg.findUniquePageID('Page'));
      const st = MMELFactory.createStartEvent(idreg.findUniqueID('Start'));
      const nc = MMELFactory.createSubprocessComponent(st);
      idreg.nodes.set(st.id, st);
      pg.childs.push(nc);
      const pgaddon = mw.subman.get(pg);
      pgaddon.map.set(st.id, nc);
      pgaddon.start = nc;
      model.events.push(st);
      oldValue.page = pg;
      model.pages.push(pg);
      idreg.pages.set(pg.id, pg);
    }
    sm.state.viewprocess = null;
    sm.state.process = null;
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

const DisplayContainer = styled.div`
  border-style: solid;
`;

export default EditProcessPage;
