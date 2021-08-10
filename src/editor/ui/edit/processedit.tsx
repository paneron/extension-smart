/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button, ButtonGroup, Intent } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React, { useState } from 'react';
import { EditorModel, EditorProcess, isEditorRegistry } from '../../model/editormodel';
import { DataType } from '../../serialize/interface/baseinterface';
import { MMELProvision } from '../../serialize/interface/supportinterface';
import { checkId } from '../../utils/commonfunctions';
import { MODAILITYOPTIONS } from '../../utils/constants';
import { createProvision } from '../../utils/EditorFactory';
import { MultiReferenceSelector, NormalComboBox, NormalTextField, ReferenceSelector } from '../common/fields';
import ListWithPopoverItem from '../common/listmanagement/listPopoverItem';
import { IMeasure, matchMeasurementFilter, MeasurementItem } from './measurementExpressionEdit';
import { matchProvisionFilter, ProvisonItem } from './provisionedit';

const NEEDSUBPROCESS = 'need sub';

const SUBPROCESSYES = 'Yes';
const SUBPROCESSNO = 'No';

const SUBPROCESSOPTIONS = [SUBPROCESSYES, SUBPROCESSNO];

function getInitProvisions(model:EditorModel, process:EditorProcess): Record<string, MMELProvision> {
  let initProvision: Record<string, MMELProvision> = {};
  Object.keys(model.provisions)
    .filter(k => process.provision.has(k))
    .forEach(k => {
      initProvision[k] = model.provisions[k];      
  });
  return initProvision;
}

function getInitMeasurement(process:EditorProcess): Record<string, IMeasure> {
  let initMeasurement: Record<string, IMeasure> = {};
  process.measure.forEach((v, k) => {
    const id = ''+k;
    initMeasurement[id] = {
      id: id,
      datatype: DataType.VARIABLE,
      measure: v
    };
  });  
  return initMeasurement;
}

const emptyMeasurement:IMeasure = {
  id: '',
  datatype: DataType.VARIABLE,
  measure: ''
}

const EditProcessPage: React.FC<{
  model: EditorModel;
  setModel: (m:EditorModel) => void;
  id: string;
  cancel: () => void;
}> = function ({ model, setModel, id, cancel }) {
  const process = model.elements[id] as EditorProcess;  

  const [editing, setEditing] = useState<EditorProcess>({...process});
  const [provisions, setProvisions] = useState<Record<string, MMELProvision>>(getInitProvisions(model, process));
  const [measurements, setMeasurements] = useState<Record<string, IMeasure>>(getInitMeasurement(process));

  const roles: Array<string> = [''];
  const regs: Array<string> = [];  
  for (const x in model.roles) {
    const role = model.roles[x];
    roles.push(role.id);
  }
  for (const x in model.elements) {
    const reg = model.elements[x];
    if (isEditorRegistry(reg)) {
      regs.push(reg.id);
    }
  }
  
  function setPID (x: string) {
    setEditing({...editing, id:x.replaceAll(/\s+/g, '')});
  }

  function setPName (x: string) {
    setEditing({...editing, name:x});    
  }

  function setPModality (x: string) {
    setEditing({...editing, modality:x});
  };

  function setPStart (x: string) {
    if (x === SUBPROCESSYES) {
      setEditing({...editing, page:NEEDSUBPROCESS});
    } else {
      setEditing({...editing, page:''});
    }
  }

  function setActor (x: number) {
    setEditing({...editing, actor:roles[x]});    
  }

  return (
    <>
      <ButtonGroup style={{textAlign:'right'}}>
        <Button
          key="ui#itemupdate#savebutton"
          icon='floppy-disk'
          intent={Intent.SUCCESS}
          text='Save'
          onClick={() => {
            const updated = save(
              id, 
              editing,
              provisions, 
              measurements,
              model
            );
            setModel({...updated});
          }}          
        />
        <Button
          key="ui#itemupdate#cancelbutton"
          icon="disable"
          intent={Intent.DANGER}
          text="Cancel"
          onClick={() => cancel()}
        />
      </ButtonGroup>
      <NormalTextField
        key="field#processID"
        text="Process ID"
        value={editing.id}
        onChange={setPID}
      />    
      <NormalTextField
        key="field#processName"
        text="Process Name"
        value={editing.name}
        onChange={setPName}
      />    
      <NormalComboBox
        key="field#processModality"
        text="Modality"
        value={editing.modality}
        options={MODAILITYOPTIONS}
        onChange={setPModality}
      />    
      <NormalComboBox
        key="field#processStart"
        text="Subprocess"
        value={editing.page === '' ? SUBPROCESSNO : SUBPROCESSYES}
        options={SUBPROCESSOPTIONS}
        onChange={setPStart}
      />    
      <ReferenceSelector
        key="field#Actor"
        text="Actor"
        filterName="Actor filter"
        value={editing.actor}
        options={roles}
        update={setActor}
      />    
      <MultiReferenceSelector
        key="field#inputSelector"
        text="Input data registry"
        options={regs}
        values={editing.input}
        filterName="Input Registry filter"
        add={x => {
          editing.input = new Set([...editing.input, ...x]);
          setEditing({ ...editing });
        }}
        remove={x => {
          editing.input = new Set([...editing.input].filter(s => !x.has(s)));
          setEditing({ ...editing });
        }}
      />
      <MultiReferenceSelector
        key="field#outputSelector"
        text="Output data registry"
        options={regs}
        values={editing.output}
        filterName="Output Registry filter"
        add={x => {
          editing.output = new Set([...editing.output, ...x]);
          setEditing({ ...editing });
        }}
        remove={x => {
          editing.output = new Set([...editing.output].filter(s => !x.has(s)));
          setEditing({ ...editing });
        }}
      />
      <ListWithPopoverItem 
        items={{...provisions}}
        setItems={x => setProvisions(x as Record<string, MMELProvision>)}
        model={model}
        initObject={createProvision('')}
        matchFilter={matchProvisionFilter}
        getListItem={x => {
          const pro = x as MMELProvision;
          return {
            id: x.id,
            text: `${pro.modality}: ${pro.condition}`
          };
        }}
        filterName='Provision filter'
        Content={ProvisonItem}
        label="Provisions"
        size={7}
        requireUniqueId={false}
      />
      <ListWithPopoverItem 
        items={{...measurements}}
        setItems={x => setMeasurements(x as Record<string, IMeasure>)}
        model={model}
        initObject={{...emptyMeasurement}}
        matchFilter={matchMeasurementFilter}
        getListItem={x => {
          const m = x as IMeasure;
          return {
            id: m.id,
            text: m.measure
          };
        }}
        filterName='Measurement filter'
        Content={MeasurementItem}
        label="Measurements"
        size={7}
        requireUniqueId={false}
      />       
    </>
  );    
};

function save(
  oldId: string, 
  process: EditorProcess, 
  provisions: Record<string, MMELProvision>, 
  measurements: Record<string, IMeasure>,
  model: EditorModel
) : EditorModel {
  if (oldId !== process.id) {
    if (checkId(process.id, model.elements)) {

    }
  } else {
    
  }
  return model;
}
  // if (oldValue !== null && newValue !== null) {
  //   const model = sm.state.modelWrapper.model;
  //   const idreg = sm.state.modelWrapper.idman;
  //   const mw = sm.state.modelWrapper;
  //   if (oldValue.id !== newValue.id) {
  //     if (newValue.id === '') {
  //       alert('ID is empty');
  //       return;
  //     }
  //     if (idreg.nodes.has(newValue.id)) {
  //       alert('New ID already exists');
  //       return;
  //     }
  //     idreg.nodes.delete(oldValue.id);
  //     idreg.nodes.set(newValue.id, oldValue);
  //     functionCollection.renameLayoutItem(oldValue.id, newValue.id);
  //     oldValue.id = newValue.id;
  //   }
  //   oldValue.name = newValue.name;
  //   oldValue.modality = newValue.modality;
  //   if (newValue.actor === '') {
  //     oldValue.actor = null;
  //   } else {
  //     const actor = idreg.roles.get(newValue.actor);
  //     if (actor?.datatype === DataType.ROLE) {
  //       oldValue.actor = actor as MMELRole;
  //     } else {
  //       console.error('Role not found: ', newValue.actor);
  //     }
  //   }
  //   oldValue.input = [];
  //   newValue.input.map(x => {
  //     const data = idreg.regs.get(x);
  //     if (data !== undefined) {
  //       oldValue.input.push(data);
  //     } else {
  //       console.error('Data not found: ', x);
  //     }
  //   });
  //   oldValue.output = [];
  //   newValue.output.map(x => {
  //     const data = idreg.regs.get(x);
  //     if (data !== undefined) {
  //       oldValue.output.push(data);
  //     } else {
  //       console.error('Data not found: ', x);
  //     }
  //   });
  //   Cleaner.cleanProvisions(oldValue);
  //   newValue.provision.map(p => {
  //     const id = idreg.findProvisionID('Provision');
  //     const pro = MMELFactory.createProvision(id);
  //     pro.condition = p.condition;
  //     pro.modality = p.modality;
  //     p.ref.map(r => {
  //       const ref = idreg.refs.get(r);
  //       if (ref === undefined) {
  //         console.error('Reference not found: ', r);
  //       } else {
  //         pro.ref.push(ref);
  //       }
  //     });
  //     model.provisions.push(pro);
  //     idreg.provisions.set(pro.id, pro);
  //     oldValue.provision.push(pro);
  //   });
  //   oldValue.measure = newValue.measure;
  //   if (oldValue.page !== null && !newValue.start) {
  //     // remove subprocess
  //     Cleaner.killPage(oldValue.page);
  //     oldValue.page = null;
  //   } else if (oldValue.page === null && newValue.start) {
  //     // add subprocess
  //     const pg = MMELFactory.createSubprocess(idreg.findUniquePageID('Page'));
  //     const st = MMELFactory.createStartEvent(idreg.findUniqueID('Start'));
  //     const nc = MMELFactory.createSubprocessComponent(st);
  //     idreg.nodes.set(st.id, st);
  //     pg.childs.push(nc);
  //     const pgaddon = mw.subman.get(pg);
  //     pgaddon.map.set(st.id, nc);
  //     pgaddon.start = nc;
  //     model.events.push(st);
  //     oldValue.page = pg;
  //     model.pages.push(pg);
  //     idreg.pages.set(pg.id, pg);
  //   }
  //   sm.state.viewprocess = null;
  //   sm.state.process = null;
  //   sm.setState(sm.state);
  // }

export default EditProcessPage;
