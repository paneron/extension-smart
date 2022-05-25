import {
  EditorDataClass,
  EditorModel,
  EditorRegistry,
  isEditorDataClass,
  isEditorRegistry,
} from '../../editormodel';
import { RegistryCombined } from '../components/element/registry';
import { ModelAction } from '../model';
import { HyEditAction } from './distributor';

type RegistryImportRefHybird = HyEditAction & { task: 'registry-import-ref' };
type DCImportRefHybird = HyEditAction & { task: 'dc-import-ref' };

export function compileRegistryRefImport(
  action: RegistryImportRefHybird,
  model: EditorModel
): ModelAction | undefined {
  const ract = reverseRegImportRefAction(action, model);
  const elm = model.elements[action.id];
  if (elm && isEditorRegistry(elm) && action.actions === undefined) {
    const actions: ModelAction[] = [
      {
        type    : 'model',
        act     : 'elements',
        task    : 'edit',
        subtask : 'registry',
        id      : action.id,
        value   : action.value,
      },
      {
        type    : 'model',
        act     : 'refs',
        task    : 'add',
        value   : action.newRefs,
        cascade : [],
      },
    ];
    action.actions = actions;
    if (ract && ract.act === 'hybird') {
      const reg = model.elements[action.id] as EditorRegistry;
      const dc = model.elements[reg.data] as EditorDataClass;
      const combined: RegistryCombined = {
        ...dc,
        title : reg.title,
        id    : reg.id,
      };
      const actions: ModelAction[] = [
        {
          type    : 'model',
          act     : 'elements',
          task    : 'edit',
          subtask : 'registry',
          id      : action.id,
          value   : combined,
        },
        {
          type    : 'model',
          act     : 'refs',
          task    : 'delete',
          value   : action.newRefs.map(x => x.id),
          cascade : [],
        },
      ];
      ract.actions = actions;
    }
  }
  return ract;
}

function reverseRegImportRefAction(
  action: RegistryImportRefHybird,
  model: EditorModel
): ModelAction {
  const reg = model.elements[action.id] as EditorRegistry;
  const dc = model.elements[reg.data] as EditorDataClass;
  return {
    type    : 'model',
    act     : 'hybird',
    task    : 'registry-import-ref',
    id      : action.id,
    value   : { ...dc, title : reg.title, id : reg.id },
    newRefs : action.delRefs.map(x => model.refs[x]),
    delRefs : action.newRefs.map(x => x.id),
  };
}

export function compileDCRefImport(
  action: DCImportRefHybird,
  model: EditorModel
): ModelAction | undefined {
  const ract = reverseDCImportRefAction(action, model);
  const elm = model.elements[action.id];
  if (elm && isEditorDataClass(elm) && action.actions === undefined) {
    const actions: ModelAction[] = [
      {
        type    : 'model',
        act     : 'elements',
        task    : 'edit',
        subtask : 'dc',
        id      : action.id,
        value   : action.value,
      },
      {
        type    : 'model',
        act     : 'refs',
        task    : 'add',
        value   : action.newRefs,
        cascade : [],
      },
    ];
    action.actions = actions;
    if (ract && ract.act === 'hybird') {
      const actions: ModelAction[] = [
        {
          type    : 'model',
          act     : 'elements',
          task    : 'edit',
          subtask : 'dc',
          id      : action.id,
          value   : model.elements[action.id],
        },
        {
          type    : 'model',
          act     : 'refs',
          task    : 'delete',
          value   : action.newRefs.map(x => x.id),
          cascade : [],
        },
      ];
      ract.actions = actions;
    }
  }
  return ract;
}

function reverseDCImportRefAction(
  action: DCImportRefHybird,
  model: EditorModel
): ModelAction {
  return {
    type    : 'model',
    act     : 'hybird',
    task    : 'dc-import-ref',
    id      : action.id,
    value   : model.elements[action.id] as EditorDataClass,
    newRefs : action.delRefs.map(x => model.refs[x]),
    delRefs : action.newRefs.map(x => x.id),
  };
}
