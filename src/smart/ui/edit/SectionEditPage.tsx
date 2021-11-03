import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import { EditorModel } from '../../model/editormodel';
import { MMELTextSection } from '../../serialize/interface/supportinterface';
import { checkId, defaultItemSorter } from '../../utils/ModelFunctions';
import { createTextSection } from '../../utils/EditorFactory';
import { IListItem, IManageHandler, NormalTextField } from '../common/fields';
import ListManagePage from '../common/listmanagement/listmanagement';

const SectionEditPage: React.FC<{
  model: EditorModel;
  setModel: (model: EditorModel) => void;
}> = function ({ model, setModel }) {
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
    for (const id of ids) {
      delete model.sections[id];
    }
    setModel(model);
  }

  function addSec(sec: MMELTextSection): boolean {
    if (checkId(sec.id, model.sections)) {
      model.sections[sec.id] = sec;
      setModel(model);
      return true;
    }
    return false;
  }

  function updateTerm(oldid: string, sec: MMELTextSection): boolean {
    if (oldid !== sec.id) {
      if (checkId(sec.id, model.sections)) {
        delete model.sections[oldid];
        model.sections[sec.id] = sec;
        setModel(model);
        return true;
      }
      return false;
    } else {
      model.sections[sec.id] = sec;
      setModel(model);
      return true;
    }
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
    updateItem: (oldid, obj) => updateTerm(oldid, obj),
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
