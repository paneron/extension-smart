import {
  addComponentIfNotFound,
  addProcessIfNotFound,
  NewImportItems,
} from '@/smart/utils/ModelImport';
import { EditorModel, isEditorProcess } from '@/smart/model/editormodel';
import { ModelAction } from '@/smart/model/editor/model';
import { HyEditAction } from '@/smart/model/editor/hybird/distributor';

type ProcessImportHybird = HyEditAction & { task: 'elm-import' };

export function compileProcessImport(
  action: ProcessImportHybird,
  model: EditorModel
): ModelAction | undefined {
  const ract: ModelAction = {
    type : 'model',
    act  : 'hybird',
    task : 'elm-import',
    id   : action.id,
    ref  : action.ref,
    x    : action.x,
    y    : action.y,
    page : action.page,
  };
  const rmodel = action.ref;
  const elm = rmodel.elements[action.id];
  if (elm && action.actions === undefined) {
    const newItems: NewImportItems = {
      elements   : {},
      pages      : {},
      provisions : {},
      roles      : {},
      figures    : {},
      tables     : {},
      vars       : {},
      refs       : {},
      notes      : {},
      links      : {},
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
      type : 'model',
      act  : 'pages',
      task : 'add-child',
      ids  : [[newElm.id, action.x, action.y]],
      page : action.page,
    };
    const removeCompo: ModelAction = {
      type : 'model',
      act  : 'pages',
      task : 'remove-child',
      ids  : [newElm.id],
      page : action.page,
    };
    const newElmsAction: ModelAction = {
      type    : 'model',
      act     : 'elements',
      task    : 'add',
      subtask : 'flowunit',
      value   : Object.values(newItems.elements),
    };
    const undoNewElmsAction: ModelAction = {
      type    : 'model',
      act     : 'elements',
      task    : 'delete',
      subtask : 'flowunit',
      value   : Object.keys(newItems.elements),
    };
    const newPageAction: ModelAction = {
      type  : 'model',
      act   : 'pages',
      task  : 'new-page',
      value : Object.values(newItems.pages),
    };
    const undoNewPageAction: ModelAction = {
      type  : 'model',
      act   : 'pages',
      task  : 'delete-page',
      value : Object.keys(newItems.pages),
    };
    const addProAction: ModelAction = {
      type : 'model',
      act  : 'provision',
      task : 'replace',
      from : [],
      to   : Object.values(newItems.provisions),
    };
    const removeProAction: ModelAction = {
      type : 'model',
      act  : 'provision',
      task : 'replace',
      from : Object.keys(newItems.provisions),
      to   : [],
    };
    const addRoleAction: ModelAction = {
      type  : 'model',
      act   : 'roles',
      task  : 'add',
      value : Object.values(newItems.roles),
    };
    const removeRoleAction: ModelAction = {
      type  : 'model',
      act   : 'roles',
      task  : 'delete',
      value : Object.keys(newItems.roles),
    };
    const addFigAction: ModelAction = {
      type  : 'model',
      act   : 'figure',
      task  : 'add',
      value : Object.values(newItems.figures),
    };
    const removeFigAction: ModelAction = {
      type  : 'model',
      act   : 'figure',
      task  : 'delete',
      value : Object.keys(newItems.figures),
    };
    const addTableAction: ModelAction = {
      type  : 'model',
      act   : 'table',
      task  : 'add',
      value : Object.values(newItems.tables),
    };
    const removeTableAction: ModelAction = {
      type  : 'model',
      act   : 'table',
      task  : 'delete',
      value : Object.keys(newItems.tables),
    };
    const addVarAction: ModelAction = {
      type  : 'model',
      act   : 'vars',
      task  : 'add',
      value : Object.values(newItems.vars),
    };
    const removeVarAction: ModelAction = {
      type  : 'model',
      act   : 'vars',
      task  : 'delete',
      value : Object.keys(newItems.vars),
    };
    const addNotesAction: ModelAction = {
      type : 'model',
      act  : 'notes',
      task : 'replace',
      from : [],
      to   : Object.values(newItems.notes),
    };
    const removeNotesAction: ModelAction = {
      type : 'model',
      act  : 'notes',
      task : 'replace',
      from : Object.keys(newItems.notes),
      to   : [],
    };
    const addRefsAction: ModelAction = {
      type  : 'model',
      act   : 'refs',
      task  : 'add',
      value : Object.values(newItems.refs),
    };
    const removeRefsAction: ModelAction = {
      type  : 'model',
      act   : 'refs',
      task  : 'delete',
      value : Object.keys(newItems.refs),
    };
    const addLinksAction: ModelAction = {
      type : 'model',
      act  : 'link',
      task : 'replace',
      to   : Object.values(newItems.links),
      from : [],
    };
    const removeLinksAction: ModelAction = {
      type : 'model',
      act  : 'link',
      task : 'replace',
      from : Object.keys(newItems.links),
      to   : [],
    };
    action.actions = [
      newCompo,
      newElmsAction,
      newPageAction,
      addProAction,
      addRoleAction,
      addFigAction,
      addTableAction,
      addVarAction,
      addNotesAction,
      addRefsAction,
      addLinksAction,
    ];
    ract.actions = [
      removeCompo,
      removeRefsAction,
      undoNewElmsAction,
      undoNewPageAction,
      removeProAction,
      removeRoleAction,
      removeFigAction,
      removeTableAction,
      removeVarAction,
      removeNotesAction,
      removeLinksAction,
    ];
  }
  return ract;
}
