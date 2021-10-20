/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { FormGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React from 'react';
import { mgd_label } from '../../../css/form';
import MGDButton from '../../MGDComponents/MGDButton';
import { EditorModel } from '../../model/editormodel';
import {
  MMELVariable,
  VarType,
} from '../../serialize/interface/supportinterface';
import { checkId, defaultItemSorter } from '../../utils/ModelFunctions';
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
import { measurementValidCheck } from '../../utils/measurement/BasicFunctions';

const MeasurementEditPage: React.FC<{
  model: EditorModel;
  setModel: (model: EditorModel) => void;
}> = function ({ model, setModel }) {
  function matchFilter(x: MMELVariable, filter: string) {
    return (
      filter === '' ||
      x.id.toLowerCase().includes(filter) ||
      x.definition.toLowerCase().includes(filter)
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

  const measureHandler: IManageHandler<MMELVariable> = {
    filterName: 'Measurement filter',
    itemName: 'Measurements',
    Content: MeasureEditItemPage,
    initObj: createVariable(''),
    model: model,
    getItems: getMeasureListItems,
    removeItems: removeMeasureListItem,
    addItem: obj => addMeasure(obj),
    updateItem: (oldid, obj) => updateMeasure(oldid, obj),
    getObjById: getMeasureById,
  };

  return <ListManagePage {...measureHandler} />;
};

const MeasureEditItemPage: React.FC<{
  object: MMELVariable;
  model?: EditorModel;
  setObject: (obj: MMELVariable) => void;
}> = ({ object: mea, model, setObject: setMeasure }) => {
  const types = Object.values(model!.vars).map(v => v.id);
  return (
    <FormGroup>
      <div key="ui#measurement#introtext">
        <label css={mgd_label}> Measurement types: </label>
        <ul>
          <li>
            <label css={mgd_label}>
              {VarType.DATA} : A single measurement value given by the user
            </label>
          </li>
          <li>
            <label css={mgd_label}>
              {VarType.LISTDATA} : A list of data items provided by the user
            </label>
          </li>
          <li>
            <label css={mgd_label}>
              {VarType.TEXT} : A text data item provided by the user
            </label>
          </li>
          <li>
            <label css={mgd_label}>
              {VarType.DERIVED} : Calulated from other measurement values
            </label>
          </li>
          <li>
            <label css={mgd_label}>
              {VarType.TABLE} : Look up values in a table
            </label>
          </li>
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
        text="Measurement ID"
        value={mea.id}
        onChange={(x: string) =>
          setMeasure({ ...mea, id: x.replaceAll(/\s+/g, '') })
        }
      />
      <NormalTextField
        text="Measurement description"
        value={mea.description}
        onChange={(x: string) => setMeasure({ ...mea, description: x })}
      />
      <NormalComboBox
        text="Measurement Type"
        value={mea.type}
        options={MEASUREMENTTYPES}
        onChange={x => setMeasure({ ...mea, type: x as VarType })}
      />
      {mea.type === VarType.DERIVED && (
        <MGDButton
          icon="derive-column"
          onClick={() => measurementValidCheck(mea.definition, model!.vars)}
        >
          Definition validity check
        </MGDButton>
      )}
      <ReferenceSelector
        text="Measurement definition"
        filterName="Measurement filter"
        editable={true}
        value={
          mea.type === VarType.DERIVED || mea.type === VarType.TABLE
            ? mea.definition
            : 'disabled'
        }
        options={types}
        update={x =>
          setMeasure({
            ...mea,
            definition: mea.definition + '[' + types[x] + ']',
          })
        }
        onChange={x => setMeasure({ ...mea, definition: x })}
      />
    </FormGroup>
  );
};

export default MeasurementEditPage;
