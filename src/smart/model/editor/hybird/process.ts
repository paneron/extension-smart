import { createNewPage } from '../../../utils/ModelAddComponentHandler';
import { EditorModel, EditorProcess, isEditorProcess } from '../../editormodel';
import { ModelAction } from '../model';
import { HyEditAction } from './distributor';

type ProcessAddPageHybird = HyEditAction & { task: 'process-add-page' };
type ProcessRemovePageHybird = HyEditAction & { task: 'process-remove-page' };

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
