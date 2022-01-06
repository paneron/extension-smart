import { createNewPage } from '../../../utils/ModelAddComponentHandler';
import { EditorModel, EditorProcess, isEditorProcess } from '../../editormodel';
import { ModelAction } from '../model';
import { HyEditAction } from './distributor';

type ProcessAddPageHybird = HyEditAction & { task: 'process-add-page' };
type ProcessRemovePageHybird = HyEditAction & { task: 'process-remove-page' };
type ProcessEditHybird = HyEditAction & { task: 'process-edit' };

export function compileProcessAddPage(
  action: ProcessAddPageHybird,
  model: EditorModel
): ModelAction | undefined {
  const ract = reverseAddPageAction(action);
  const elm = model.elements[action.id];
  if (elm && isEditorProcess(elm) && action.actions === undefined) {
    const [page, start] = createNewPage(model);
    const newProcess: EditorProcess = { ...elm, page: page.id };
    const actions: ModelAction[] = [
      {
        type: 'model',
        act: 'elements',
        task: 'edit',
        subtask: 'flowunit',
        id: action.id,
        value: newProcess,
      },
      {
        type: 'model',
        act: 'elements',
        task: 'add',
        subtask: 'flowunit',
        value: [start],
      },
      {
        type: 'model',
        act: 'pages',
        task: 'new-page',
        value: page,
      },
    ];
    action.actions = actions;
    if (ract && ract.act === 'hybird') {
      ract.actions = [
        {
          type: 'model',
          act: 'elements',
          task: 'edit',
          subtask: 'flowunit',
          id: action.id,
          value: elm,
        },
        {
          type: 'model',
          act: 'elements',
          task: 'delete',
          subtask: 'flowunit',
          value: [start.id],
        },
        {
          type: 'model',
          act: 'pages',
          task: 'delete-page',
          value: page.id,
        },
      ];
    }
  }
  return ract;
}

function reverseAddPageAction(action: ProcessAddPageHybird): ModelAction {
  return {
    type: 'model',
    act: 'hybird',
    task: 'process-remove-page',
    id: action.id,
  };
}

export function compileProcessRemovePage(
  action: ProcessRemovePageHybird,
  model: EditorModel
): ModelAction | undefined {
  const ract = reverseRemovePageAction(action);
  const elm = model.elements[action.id];
  if (elm && isEditorProcess(elm) && action.actions === undefined) {
    throw new Error('No action should come to this directly');
  }
  return ract;
}

function reverseRemovePageAction(action: ProcessRemovePageHybird): ModelAction {
  return {
    type: 'model',
    act: 'hybird',
    task: 'process-add-page',
    id: action.id,
  };
}

export function compileProcessEdit(
  action: ProcessEditHybird,
  model: EditorModel
): ModelAction | undefined {
  const reverse = reverseProcessEditAction(action, model);
  const elm = model.elements[action.id];
  if (elm && isEditorProcess(elm) && action.actions === undefined) {
    const actions: ModelAction[] = [
      {
        type: 'model',
        act: 'elements',
        task: 'edit',
        subtask: 'flowunit',
        id: action.id,
        value: action.process,
      },
      {
        type: 'model',
        act: 'provision',
        task: 'replace',
        from: [...elm.provision],
        to: action.provisions,
      },
      {
        type: 'model',
        act: 'notes',
        task: 'replace',
        from: [...elm.notes],
        to: action.notes,
      },
      {
        type: 'model',
        act: 'link',
        task: 'replace',
        from: [...elm.links],
        to: action.links,
      },
    ];
    action.actions = actions;
    if (reverse && reverse.act === 'hybird') {
      reverse.actions = [
        {
          type: 'model',
          act: 'elements',
          task: 'edit',
          subtask: 'flowunit',
          id: action.process.id,
          value: elm,
        },
        {
          type: 'model',
          act: 'provision',
          task: 'replace',
          from: action.provisions.map(x => x.id),
          to: [...elm.provision].map(x => model.provisions[x]),
        },
        {
          type: 'model',
          act: 'notes',
          task: 'replace',
          from: action.notes.map(x => x.id),
          to: [...elm.notes].map(x => model.notes[x]),
        },
        {
          type: 'model',
          act: 'link',
          task: 'replace',
          from: action.links.map(x => x.id),
          to: [...elm.links].map(x => model.links[x]),
        },
      ];
    }
  }
  return reverse;
}

function reverseProcessEditAction(
  action: ProcessEditHybird,
  model: EditorModel
): ModelAction {
  const elm = model.elements[action.id];
  if (elm && isEditorProcess(elm)) {
    return {
      type: 'model',
      act: 'hybird',
      task: 'process-edit',
      id: action.process.id,
      process: elm,
      provisions: [...elm.provision].map(x => model.provisions[x]),
      notes: [...elm.notes].map(x => model.notes[x]),
      links: [...elm.links].map(x => model.links[x]),
    };
  }
  throw new Error(`Process with ${action.id} not found`);
}
