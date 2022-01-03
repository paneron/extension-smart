import { EditorNode } from '../../../editormodel';

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
