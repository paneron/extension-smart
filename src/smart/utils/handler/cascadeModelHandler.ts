import {
  EditorApproval,
  EditorDataClass,
  EditorNode,
  EditorProcess,
  isEditorDataClass,
  isEditorProcess,
} from '../../model/editormodel';
import { MMELProvision } from '../../serialize/interface/supportinterface';
import { isApproval } from '../../serialize/util/validation';
import { setReplace } from '../ModelFunctions';

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

export function refDCReplace(
  elms: Record<string, EditorNode>,
  ids: [string, string[]][],
  from: string | undefined,
  to: string | undefined
) {
  const newElms = { ...elms };
  for (const [dcid, attid] of ids) {
    const elm = elms[dcid];
    if (isEditorDataClass(elm)) {
      const newDC: EditorDataClass = { ...elm };
      const newAtt = { ...newDC.attributes };
      for (const a of attid) {
        newAtt[a].ref = setReplace(newAtt[a].ref, from, to);
      }
      newDC.attributes = newAtt;
    }
  }
  return newElms;
}

export function refProvisionReplace(
  pros: Record<string, MMELProvision>,
  ids: string[],
  from: string | undefined,
  to: string | undefined
) {
  const newPros = { ...pros };
  for (const id of ids) {
    const pro = { ...newPros[id] };
    pro.ref = setReplace(pro.ref, from, to);
    newPros[id] = pro;
  }
  return newPros;
}
