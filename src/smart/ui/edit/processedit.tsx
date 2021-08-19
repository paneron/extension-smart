/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { FormGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React, { useState } from 'react';
import { EditorModel, EditorProcess } from '../../model/editormodel';
import { DataType } from '../../serialize/interface/baseinterface';
import { MMELProvision } from '../../serialize/interface/supportinterface';
import {
  checkId,
  getModelAllRegs,
  getModelAllRolesWithEmpty,
  removeSpace,
  updatePageElement,
} from '../../utils/commonfunctions';
import { createProvision } from '../../utils/EditorFactory';
import { createNewPage } from '../../utils/ModelAddComponentHandler';
import { deletePage } from '../../utils/ModelRemoveComponentHandler';
import {
  MultiReferenceSelector,
  NormalComboBox,
  NormalTextField,
  ReferenceSelector,
} from '../common/fields';
import ListWithPopoverItem from '../common/listmanagement/listPopoverItem';
import { EditPageButtons } from './commons';
import {
  IMeasure,
  matchMeasurementFilter,
  MeasurementItem,
} from './measurementExpressionEdit';
import { matchProvisionFilter, ProvisonItem } from './provisionedit';

const NEEDSUBPROCESS = 'need sub';

const SUBPROCESSYES = 'Yes';
const SUBPROCESSNO = 'No';

const SUBPROCESSOPTIONS = [SUBPROCESSYES, SUBPROCESSNO];

function getInitProvisions(
  model: EditorModel,
  process: EditorProcess
): Record<string, MMELProvision> {
  const initProvision: Record<string, MMELProvision> = {};
  Object.keys(model.provisions)
    .filter(k => process.provision.has(k))
    .forEach(k => {
      initProvision[k] = model.provisions[k];
    });
  return initProvision;
}

function getInitMeasurement(process: EditorProcess): Record<string, IMeasure> {
  const initMeasurement: Record<string, IMeasure> = {};
  process.measure.forEach((v, k) => {
    const id = '' + k;
    initMeasurement[id] = {
      id: id,
      datatype: DataType.VARIABLE,
      measure: v,
    };
  });
  return initMeasurement;
}

const emptyMeasurement: IMeasure = {
  id: '',
  datatype: DataType.VARIABLE,
  measure: '',
};

const EditProcessPage: React.FC<{
  model: EditorModel;
  setModel: (m: EditorModel) => void;
  id: string;
  closeDialog: () => void;
}> = function ({ model, setModel, id, closeDialog }) {
  const process = model.elements[id] as EditorProcess;

  const [editing, setEditing] = useState<EditorProcess>({ ...process });
  const [provisions, setProvisions] = useState<Record<string, MMELProvision>>(
    getInitProvisions(model, process)
  );
  const [measurements, setMeasurements] = useState<Record<string, IMeasure>>(
    getInitMeasurement(process)
  );

  const roles = getModelAllRolesWithEmpty(model);
  const regs = getModelAllRegs(model);

  function setPStart(x: string) {
    if (x === SUBPROCESSYES) {
      setEditing({ ...editing, page: NEEDSUBPROCESS });
    } else {
      setEditing({ ...editing, page: '' });
    }
  }

  function onUpdateClick() {
    const updated = save(id, editing, provisions, measurements, model);
    if (updated !== null) {
      setModel({ ...updated });
      closeDialog();
    }
  }

  return (
    <FormGroup>
      <EditPageButtons
        onUpdateClick={onUpdateClick}
        onCancelClick={closeDialog}
      />
      <NormalTextField
        key="field#processID"
        text="Process ID"
        value={editing.id}
        onChange={x => setEditing({ ...editing, id: removeSpace(x) })}
      />
      <NormalTextField
        key="field#processName"
        text="Process Name"
        value={editing.name}
        onChange={x => setEditing({ ...editing, name: x })}
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
        update={x => setEditing({ ...editing, actor: roles[x] })}
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
        items={{ ...provisions }}
        setItems={x => setProvisions(x as Record<string, MMELProvision>)}
        model={model}
        initObject={createProvision('')}
        matchFilter={matchProvisionFilter}
        getListItem={x => {
          const pro = x as MMELProvision;
          return {
            id: x.id,
            text: `${pro.modality}: ${pro.condition}`,
          };
        }}
        filterName="Provision filter"
        Content={ProvisonItem}
        label="Provisions"
        size={7}
        requireUniqueId={false}
      />
      <ListWithPopoverItem
        items={{ ...measurements }}
        setItems={x => setMeasurements(x as Record<string, IMeasure>)}
        model={model}
        initObject={{ ...emptyMeasurement }}
        matchFilter={matchMeasurementFilter}
        getListItem={x => {
          const m = x as IMeasure;
          return {
            id: m.id,
            text: m.measure,
          };
        }}
        filterName="Measurement filter"
        Content={MeasurementItem}
        label="Measurements"
        size={7}
        requireUniqueId={false}
      />
    </FormGroup>
  );
};

function save(
  oldId: string,
  process: EditorProcess,
  provisions: Record<string, MMELProvision>,
  measurements: Record<string, IMeasure>,
  model: EditorModel
): EditorModel | null {
  process.provision = new Set(Object.values(provisions).map(p => p.id));
  process.measure = Object.values(measurements).map(m => m.measure);
  const oldProcess = model.elements[oldId] as EditorProcess;
  if (oldId !== process.id) {
    if (checkId(process.id, model.elements)) {
      delete model.elements[oldId];
      for (const p in model.pages) {
        const page = model.pages[p];
        updatePageElement(page, oldId, process);
      }
      model.elements[process.id] = process;
      model.provisions = updateProvisions(
        model.provisions,
        oldProcess.provision,
        provisions
      );
      checkPage(model, oldProcess.page, process);
    } else {
      return null;
    }
  } else {
    model.elements[oldId] = process;
    model.provisions = updateProvisions(
      model.provisions,
      oldProcess.provision,
      provisions
    );
    checkPage(model, oldProcess.page, process);
  }
  return model;
}

function updateProvisions(
  provisions: Record<string, MMELProvision>,
  old: Set<string>,
  update: Record<string, MMELProvision>
): Record<string, MMELProvision> {
  for (const x of old) {
    delete provisions[x];
  }
  let x = 1;
  for (const p in update) {
    const pro = update[p];
    while (provisions['Provision' + x] !== undefined) {
      x++;
    }
    pro.id = 'Provision' + x;
    provisions[pro.id] = pro;
    x++;
  }
  return { ...provisions };
}

function checkPage(
  model: EditorModel,
  oldPage: string,
  process: EditorProcess
) {
  const oldHasPage = oldPage !== '';
  const newHasPage = process.page !== '';
  if (!oldHasPage && newHasPage) {
    process.page = createNewPage(model);
  } else if (oldHasPage && !newHasPage) {
    deletePage(model, oldPage);
  }
}

export default EditProcessPage;
