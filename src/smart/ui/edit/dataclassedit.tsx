import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import {
  EditorDataClass,
  EditorModel,
  isEditorDataClass,
} from '../../model/editormodel';
import { checkId, defaultItemSorter } from '../../utils/ModelFunctions';
import { createDataClass } from '../../utils/EditorFactory';
import { IListItem, IManageHandler, NormalTextField } from '../common/fields';
import ListManagePage from '../common/listmanagement/listmanagement';
import AttributeEditPage from './attributeedit';
import { ModelAction } from '../../model/editor/model';

const initObj = createDataClass('');

const DataClassEditPage: React.FC<{
  model: EditorModel;
  act: (x: ModelAction) => void;
}> = function ({ model, act }) {
  function matchFilter(x: EditorDataClass, filter: string) {
    return filter === '' || x.id.toLowerCase().includes(filter);
  }

  function getDCListItems(filter: string): IListItem[] {
    return Object.values(model.elements)
      .filter(
        x => isEditorDataClass(x) && x.mother === '' && matchFilter(x, filter)
      )
      .map(x => ({ id: x.id, text: x.id }))
      .sort(defaultItemSorter);
  }

  function removeDCListItem(ids: string[]) {
    const action: ModelAction = {
      type: 'model',
      act: 'elements',
      task: 'delete',
      subtask: 'dc',
      value: ids,
    };
    act(action);
  }

  function addDC(dc: EditorDataClass): boolean {
    if (checkId(dc.id, model.elements)) {
      const action: ModelAction = {
        type: 'model',
        act: 'elements',
        task: 'add',
        subtask: 'dc',
        value: [dc],
      };
      act(action);
      return true;
    }
    return false;
  }

  function updateDC(oldid: string, dc: EditorDataClass): boolean {
    if (oldid !== dc.id && !checkId(dc.id, model.elements)) {
      return false;
    }
    const action: ModelAction = {
      type: 'model',
      act: 'elements',
      task: 'edit',
      subtask: 'dc',
      id: oldid,
      value: dc,
    };
    act(action);
    return true;
  }

  function getDCById(id: string): EditorDataClass {
    const dc = model.elements[id];
    if (isEditorDataClass(dc)) {
      return dc;
    }
    return { ...initObj };
  }

  const dchandler: IManageHandler<EditorDataClass> = {
    filterName: 'Data structure filter',
    itemName: 'Data Structures',
    Content: DataClassItemPage,
    initObj: { ...initObj },
    model: model,
    getItems: getDCListItems,
    removeItems: removeDCListItem,
    addItem: obj => addDC(obj),
    updateItem: (oldid, obj) => updateDC(oldid, obj),
    getObjById: getDCById,
  };

  return <ListManagePage {...dchandler} />;
};

const DataClassItemPage: React.FC<{
  object: EditorDataClass;
  model?: EditorModel;
  setObject: (obj: EditorDataClass) => void;
  oldid: string;
}> = ({ object: dc, model, setObject: setDC, oldid }) => {
  return (
    <FormGroup>
      <NormalTextField        
        text="Dataclass ID"
        value={dc.id}
        onChange={x => setDC({ ...dc, id: x.replaceAll(/\s+/g, '') })}
      />
      <AttributeEditPage        
        attributes={{ ...dc.attributes }}
        model={model!}
        setAtts={x => setDC({ ...dc, attributes: x })}        
        oldid={oldid}
      />
    </FormGroup>
  );
};

export default DataClassEditPage;
