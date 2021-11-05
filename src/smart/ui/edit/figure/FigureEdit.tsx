import React from 'react';
import {
  EditorModel,
  EditorProcess,
  isEditorProcess,
} from '../../../model/editormodel';
import { MMELFigure } from '../../../serialize/interface/supportinterface';
import { checkId, defaultItemSorter } from '../../../utils/ModelFunctions';
import { createFig } from '../../../utils/EditorFactory';
import { IListItem, IManageHandler } from '../../common/fields';
import ListManagePage from '../../common/listmanagement/listmanagement';
import FigItemEditPage from './FigureItemEdit';

const FigureEditPage: React.FC<{
  model: EditorModel;
  setModel: (model: EditorModel) => void;
}> = function ({ model, setModel }) {
  function matchFilter(x: MMELFigure, filter: string) {
    return (
      filter === '' ||
      x.id.toLowerCase().includes(filter) ||
      x.title.toLowerCase().includes(filter)
    );
  }

  function getFigListItems(filter: string): IListItem[] {
    return Object.values(model.figures)
      .filter(x => matchFilter(x, filter))
      .map(x => ({ id: x.id, text: x.title }))
      .sort(defaultItemSorter);
  }

  function replaceReferences(matchid: string, replaceid: string) {
    for (const x in model.elements) {
      const elm = model.elements[x];
      if (isEditorProcess(elm)) {
        const newSet = new Set([...elm.figures]);
        if (newSet.has(matchid)) {
          newSet.delete(matchid);
          newSet.add(replaceid);
          const newElm: EditorProcess = { ...elm, figures: newSet };
          model.elements[x] = newElm;
        }
      }
    }
  }

  function removeFigListItem(ids: string[]) {
    for (const id of ids) {
      delete model.figures[id];
    }
    setModel(model);
  }

  function addFig(x: MMELFigure): boolean {
    if (checkId(x.id, model.figures)) {
      model.figures[x.id] = { ...x };
      setModel(model);
      return true;
    }
    return false;
  }

  function updateFig(oldid: string, x: MMELFigure): boolean {
    if (oldid !== x.id) {
      if (checkId(x.id, model.figures)) {
        delete model.figures[oldid];
        model.figures[x.id] = { ...x };
        replaceReferences(oldid, x.id);
        setModel(model);
        return true;
      }
      return false;
    } else {
      model.figures[oldid] = { ...x };
      setModel(model);
      return true;
    }
  }

  function getFigById(id: string): MMELFigure {
    const fig = model.figures[id];
    if (fig === undefined) {
      return createFig('');
    }
    return fig;
  }

  const fighandler: IManageHandler<MMELFigure> = {
    filterName: 'Figure filter',
    itemName: 'View figures',
    Content: FigItemEditPage,
    initObj: createFig(''),
    model: model,
    getItems: getFigListItems,
    removeItems: removeFigListItem,
    addItem: obj => addFig(obj),
    updateItem: (oldid, obj) => updateFig(oldid, obj),
    getObjById: getFigById,
  };

  return <ListManagePage {...fighandler} />;
};

export default FigureEditPage;
