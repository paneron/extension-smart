import { EditorNode } from '../../../editormodel';
import { ModelAction } from '../../model';
import { ElmAction } from '../elements';

export function delCommonElms(
  elms: Record<string, EditorNode>,
  ids: string[]
): Record<string, EditorNode> {
  for (const id of ids) {
    delete elms[id];
  }
  return elms;
}

export function addCommonElms(
  elms: Record<string, EditorNode>,
  items: EditorNode[]
): Record<string, EditorNode> {
  for (const item of items) {
    elms[item.id] = { ...item };
  }
  return elms;
}

export function editCommonElms(
  elms: Record<string, EditorNode>,
  id: string,
  item: EditorNode
): Record<string, EditorNode> {
  delete elms[id];
  elms[item.id] = { ...item };
  return elms;
}

export function cascadeCheckElm(
  elms: Record<string, EditorNode>,
  page: string,
  action: ElmAction
): ModelAction[] | undefined {
  if (action.cascade) {
    return undefined;
  }
  if (action.task === 'edit') {
    if (action.id === action.value.id) {
      return [];
    } else {
      action.cascade = [
        {
          type: 'model',
          act: 'pages',
          task: 'replace-id',
          id: action.id,
          page,
          value: action.value.id,
        },
      ];
      return [
        {
          type: 'model',
          act: 'pages',
          task: 'replace-id',
          id: action.value.id,
          page,
          value: action.id,
        },
      ];
    }
  }
  return [];
}
