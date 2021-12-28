import {
  EditorApproval,
  EditorNode,
  EditorProcess,
  isEditorProcess,
} from '../../model/editormodel';
import { isApproval } from '../../serialize/util/validation';

export type RoleAttribute = 'actor' | 'approver';

export function roleReplace(
  elms: Record<string, EditorNode>,
  ids: [string, RoleAttribute[]][],
  role: string
): Record<string, EditorNode> {
  const newElms = { ...elms };
  for (const [id, attributes] of ids) {
    const elm = elms[id];
    if (elm) {
      if (isEditorProcess(elm)) {
        const newProcess: EditorProcess = { ...elm, actor: role };
        newElms[elm.id] = newProcess;
      } else if (isApproval(elm)) {
        const newApproval: EditorApproval = { ...elm };
        for (const a of attributes) {
          newApproval[a] = role;
        }
        newElms[elm.id] = newApproval;
      }
    }
  }
  return newElms;
}
