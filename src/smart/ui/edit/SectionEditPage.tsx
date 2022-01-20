import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import { EditorModel } from '../../model/editormodel';
import { MMELTextSection } from '../../serialize/interface/supportinterface';
import { checkId, defaultItemSorter } from '../../utils/ModelFunctions';
import { createTextSection } from '../../utils/EditorFactory';
import { IListItem, IManageHandler, NormalTextField } from '../common/fields';
import ListManagePage from '../common/listmanagement/listmanagement';
import { EditorAction } from '../../model/editor/state';
import { ModelAction } from '../../model/editor/model';

const SectionEditPage: React.FC<{
  model: EditorModel;
  act: (x: EditorAction) => void;
}> = function ({ model, act }) {
  function matchFilter(sec: MMELTextSection, filter: string) {
    return filter === '' || sec.title.toLowerCase().includes(filter);
  }

  function getSecListItems(filter: string): IListItem[] {
    return Object.values(model.sections)
      .filter(x => matchFilter(x, filter))
      .map(x => ({ id: x.id, text: x.title }))
      .sort(defaultItemSorter);
  }

  function removeSecListItem(ids: string[]) {
    const action: ModelAction = {
      type: 'model',
      act: 'section',
      task: 'delete',
      value: ids,
    };
    act(action);
  }

  function addSec(sec: MMELTextSection): boolean {
    if (checkId(sec.id, model.sections)) {
      const action: ModelAction = {
        type: 'model',
        act: 'section',
        task: 'add',
        value: [sec],
      };
      act(action);
      return true;
    }
    return false;
  }

  function updateSec(oldid: string, sec: MMELTextSection): boolean {
    if (oldid !== sec.id && !checkId(sec.id, model.sections)) {
      return false;
    }
    const action: ModelAction = {
      type: 'model',
      act: 'section',
      task: 'edit',
      id: oldid,
      value: sec,
    };
    act(action);
    return true;
  }

  function getSecById(id: string): MMELTextSection {
    const term = model.sections[id];
    if (term === undefined) {
      return createTextSection('');
    }
    return term;
  }

  const termhandler: IManageHandler<MMELTextSection> = {
    filterName: 'Section filter',
    itemName: 'Sections',
    Content: SecEditItemPage,
    initObj: createTextSection(''),
    model,
    getItems: getSecListItems,
    removeItems: removeSecListItem,
    addItem: obj => addSec(obj),
    updateItem: (oldid, obj) => updateSec(oldid, obj),
    getObjById: getSecById,
  };

  return <ListManagePage {...termhandler} />;
};

const SecEditItemPage: React.FC<{
  object: MMELTextSection;
  setObject: (obj: MMELTextSection) => void;
}> = ({ object: sec, setObject: setSec }) => {
  return (
    <FormGroup>
      <NormalTextField
        text="Section ID"
        value={sec.id}
        onChange={x => setSec({ ...sec, id: x.replaceAll(/\s+/g, '') })}
      />
      <NormalTextField
        text="Section title"
        value={sec.title}
        onChange={x => setSec({ ...sec, title: x })}
      />
      <NormalTextField
        text="Contents"
        value={sec.content}
        onChange={x => setSec({ ...sec, content: x })}
      />
    </FormGroup>
  );
};

export default SectionEditPage;
