import React from 'react';
import { EditorModel } from '../../../model/editormodel';
import { MMELFigure } from '../../../serialize/interface/supportinterface';
import { checkId, defaultItemSorter } from '../../../utils/ModelFunctions';
import { createFig } from '../../../utils/EditorFactory';
import { IListItem, IManageHandler } from '../../common/fields';
import ListManagePage from '../../common/listmanagement/listmanagement';
import FigItemEditPage from './FigureItemEdit';
import { ModelAction } from '../../../model/editor/model';

const FigureEditPage: React.FC<{
  model: EditorModel;
  act: (x: ModelAction) => void;
}> = function ({ model, act }) {
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

  function removeFigListItem(ids: string[]) {
    const action:ModelAction = {
      type:'model',
      act:'figure',
      task: 'delete',
      value: ids
    }
    act(action);    
  }

  function addFig(x: MMELFigure): boolean {
    if (checkId(x.id, model.figures)) {
      const action:ModelAction = {
        type:'model',
        act:'figure',
        task: 'add',
        value: [x]
      }
      act(action);
      return true;
    }
    return false;
  }

  function updateFig(oldid: string, x: MMELFigure): boolean {
    if (oldid !== x.id && !checkId(x.id, model.figures)) {
      return false;
    }
    const action:ModelAction = {
      type:'model',
      act:'figure',
      task: 'edit',
      id: oldid,      
      value: x
    }
    act(action);
    return true;
  }

  function getFigById(id: string): MMELFigure {
    const fig = model.figures[id];
    if (fig === undefined) {
      return createFig('');
    }
    return fig;
  }

  const fighandler: IManageHandler<MMELFigure> = {
    filterName: 'Content filter',
    itemName: 'View contents',
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
