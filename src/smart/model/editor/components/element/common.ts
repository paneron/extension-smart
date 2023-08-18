import type { EditorNode } from '@/smart/model/editormodel';
import type { ModelAction } from '@/smart/model/editor/model';
import type { ElmAction } from '@/smart/model/editor/components/elements';

/**
 * Handle the command to delete elements in the model
 * @param elms the elements in the model
 * @param ids Array of IDs of elements to be deleted
 * @returns The updated elements in the model
 */
export function delCommonElms(
  elms: Record<string, EditorNode>,
  ids: string[]
): Record<string, EditorNode> {
  for (const id of ids) {
    delete elms[id];
  }
  return elms;
}

/**
 * Handle the command to add elements to the model
 * @param elms The elements in the model
 * @param items The new elements to be added
 * @returns The updated elements in the model
 */
export function addCommonElms(
  elms: Record<string, EditorNode>,
  items: EditorNode[]
): Record<string, EditorNode> {
  for (const item of items) {
    elms[item.id] = { ...item };
  }
  return elms;
}

/**
 * Handle the command to edit an element
 * @param elms The elements in the model
 * @param id The ID of the element to be edited
 * @param item The updated content of the element
 * @returns The updated elements in the model
 */
export function editCommonElms(
  elms: Record<string, EditorNode>,
  id: string,
  item: EditorNode
): Record<string, EditorNode> {
  delete elms[id];
  elms[item.id] = { ...item };
  return elms;
}

/**
 * Examine the action and generate cascade actions.
 * For edit action that the element ID is changed, a cascade action to replace all references of edges is issued
 * @param page Page ID
 * @param action The action about element
 * @returns The cascade action array for undo
 */
export function cascadeCheckElm(
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
          type  : 'model',
          act   : 'pages',
          task  : 'replace-id',
          id    : action.id,
          page,
          value : action.value.id,
        },
      ];
      return [
        {
          type  : 'model',
          act   : 'pages',
          task  : 'replace-id',
          id    : action.value.id,
          page,
          value : action.id,
        },
      ];
    }
  }
  return [];
}
