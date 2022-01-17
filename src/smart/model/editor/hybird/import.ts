import {
  addComponentIfNotFound,
  addProcessIfNotFound,
  NewImportItems,
} from '../../../utils/ModelImport';
import { EditorModel, isEditorProcess } from '../../editormodel';
import { ModelAction } from '../model';
import { HyEditAction } from './distributor';

type ProcessImportHybird = HyEditAction & { task: 'elm-import' };

export function compileProcessImport(
  action: ProcessImportHybird,
  model: EditorModel
): ModelAction | undefined {
  const ract: ModelAction = {
    type: 'model',
    act: 'hybird',
    task: 'elm-import',
    id: action.id,
    ref: action.ref,
    x: action.x,
    y: action.y,
    page: action.page,
  };
  const rmodel = action.ref;
  const elm = rmodel.elements[action.id];
  if (elm && action.actions === undefined) {
    const newItems: NewImportItems = {
      elements: {},
      pages: {},
      provisions: {},
      roles: {},
      figures: {},
      tables: {},
      vars: {},
      refs: {},
      notes: {},
      links: {},
    };
    const newElm = isEditorProcess(elm)
      ? addProcessIfNotFound(
          model,
          rmodel,
          action.id,
          {},
          {},
          {},
          newItems,
          action.page
        )
      : addComponentIfNotFound(
          model,
          rmodel,
          action.id,
          {},
          {},
          {},
          newItems,
          action.page
        );
    const newCompo: ModelAction = {
      type: 'model',
      act: 'pages',
      task: 'add-child',
      ids: [[newElm.id, action.x, action.y]],
      page: action.page,
    };
    const removeCompo: ModelAction = {
      type: 'model',
      act: 'pages',
      task: 'remove-child',
      ids: [newElm.id],
      page: action.page,
    };
    const newElmsAction: ModelAction = {
      type: 'model',
      act: 'elements',
      task: 'add',
      subtask: 'flowunit',
      value: Object.values(newItems.elements),
    };
    const undoNewElmsAction: ModelAction = {
      type: 'model',
      act: 'elements',
      task: 'delete',
      subtask: 'flowunit',
      value: Object.keys(newItems.elements),
    };
    const newPageAction: ModelAction = {
      type: 'model',
      act: 'pages',
      task: 'new-page',
      value: Object.values(newItems.pages),
    };
    const undoNewPageAction: ModelAction = {
      type: 'model',
      act: 'pages',
      task: 'delete-page',
      value: Object.keys(newItems.pages),
    };
    action.actions = [newCompo, newElmsAction, newPageAction];
    ract.actions = [removeCompo, undoNewElmsAction, undoNewPageAction];
  }
  return ract;
}
