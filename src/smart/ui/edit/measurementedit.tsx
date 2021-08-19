/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button, FormGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React from 'react';
import { EditorModel } from '../../model/editormodel';
import { MMELObject } from '../../serialize/interface/baseinterface';
import {
  MMELVariable,
  VarType,
} from '../../serialize/interface/supportinterface';
import { checkId, defaultItemSorter } from '../../utils/commonfunctions';
import { MEASUREMENTTYPES } from '../../utils/constants';
import { createVariable } from '../../utils/EditorFactory';
import {
  IListItem,
  IManageHandler,
  NormalComboBox,
  NormalTextField,
  ReferenceSelector,
} from '../common/fields';
import ListManagePage from '../common/listmanagement/listmanagement';

const MeasurementEditPage: React.FC<{
  model: EditorModel;
  setModel: (model: EditorModel) => void;
}> = function ({ model, setModel }) {
  function matchFilter(x: MMELVariable, filter: string) {
    return (
      filter === '' ||
      x.id.toLowerCase().indexOf(filter) !== -1 ||
      x.definition.toLowerCase().indexOf(filter) !== -1
    );
  }

  function getMeasureListItems(filter: string): IListItem[] {
    return Object.values(model.vars)
      .filter(x => matchFilter(x, filter))
      .map(x => ({ id: x.id, text: x.id }))
      .sort(defaultItemSorter);
  }

  function removeMeasureListItem(ids: string[]) {
    for (const id of ids) {
      delete model.vars[id];
    }
    setModel(model);
  }

  function addMeasure(x: MMELVariable): boolean {
    if (checkId(x.id, model.vars)) {
      model.vars[x.id] = { ...x };
      setModel(model);
      return true;
    }
    return false;
  }

  function updateMeasure(oldid: string, x: MMELVariable): boolean {
    if (oldid !== x.id) {
      if (checkId(x.id, model.vars)) {
        delete model.vars[oldid];
        model.vars[x.id] = { ...x };
        setModel(model);
        return true;
      }
      return false;
    } else {
      model.vars[oldid] = { ...x };
      setModel(model);
      return true;
    }
  }

  function getMeasureById(id: string): MMELVariable {
    const role = model.vars[id];
    if (role === undefined) {
      return createVariable('');
    }
    return role;
  }

  const rolehandler: IManageHandler = {
    filterName: 'Measurement filter',
    itemName: 'Measurements',
    Content: MeasureEditItemPage,
    initObj: createVariable(''),
    model: model,
    getItems: getMeasureListItems,
    removeItems: removeMeasureListItem,
    addItem: obj => addMeasure(obj as MMELVariable),
    updateItem: (oldid, obj) => updateMeasure(oldid, obj as MMELVariable),
    getObjById: getMeasureById,
  };

  return <ListManagePage {...rolehandler} />;
};

const MeasureEditItemPage: React.FC<{
  object: MMELObject;
  model: EditorModel;
  setObject: (obj: MMELObject) => void;
}> = ({ object, model, setObject }) => {
  const mea = object as MMELVariable;

  const types = Object.values(model.vars).map(v => v.id);
  return (
    <FormGroup>
      <div key="ui#measurement#introtext">
        Measurement types:
        <ul>
          <li>
            {' '}
            {VarType.DATA} : A single measurement value given by the user{' '}
          </li>
          <li>
            {' '}
            {VarType.LISTDATA} : A list of data items provided by the user
          </li>
          <li> {VarType.DERIVED} : Calulated from other measurement values </li>
        </ul>
        The definition field is applicable to {VarType.DERIVED} only. Example
        definitions:
        <ul>
          <li> [numPersons_Sales] + [numPersons_HR] </li>
          <li> [temperature].average </li>
        </ul>
        The first example adds two single measurements together which represent
        the total number of people in the two departments. The second one has an
        input of a list of temperature readings (e.g., from sensors). It
        calculates the average temperature from the sensor.
      </div>
      <NormalTextField
        key="field#varid"
        text="Measurement ID"
        value={mea.id}
        onChange={(x: string) => {
          mea.id = x.replaceAll(/\s+/g, '');
          setObject({ ...mea });
        }}
      />
      <NormalTextField
        key="field#vardescription"
        text="Measurement description"
        value={mea.description}
        onChange={(x: string) => {
          mea.description = x;
          setObject({ ...mea });
        }}
      />
      <NormalComboBox
        key="field#vartype"
        text="Measurement Type"
        value={mea.type}
        options={MEASUREMENTTYPES}
        onChange={x => {
          mea.type = x as VarType;
          setObject({ ...mea });
        }}
      />
      {mea.type === VarType.DERIVED && (
        <Button
          key="ui#measurement#builderbutton#holder"
          icon="derive-column"
          text="Definition validity check"
          onClick={() => validCheck(mea.definition, model)}
        />
      )}
      <ReferenceSelector
        key="field#vardefinition"
        text="Measurement definition"
        filterName="Measurement filter"
        editable={true}
        value={mea.type === VarType.DERIVED ? mea.definition : 'disabled'}
        options={types}
        update={(x: number) => {
          mea.definition += '[' + types[x] + ']';
          setObject({ ...mea });
        }}
        onChange={(x: string) => {
          mea.definition = x;
          setObject({ ...mea });
        }}
      />
    </FormGroup>
  );
};

function validCheck(def: string, model: EditorModel) {
  const results = Array.from(def.matchAll(/\[.*?\]/g));
  let ok = true;
  for (const r of results) {
    const name = r[0].substr(1, r[0].length - 2);
    if (model.vars[name] === undefined) {
      alert(name + ' is not a measurement');
      ok = false;
    }
  }
  if (ok) {
    alert('All measurement names can be resolved');
  }
}

export default MeasurementEditPage;
