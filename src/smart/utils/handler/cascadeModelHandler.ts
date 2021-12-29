import { RegCascadeIDs } from '../../model/editor/components/elements';
import {
  EditorApproval,
  EditorDataClass,
  EditorNode,
  EditorProcess,
  EditorSubprocess,
  isEditorApproval,
  isEditorDataClass,
  isEditorProcess,
} from '../../model/editormodel';
import { DataType } from '../../serialize/interface/baseinterface';
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

export function regReplace(
  elms: Record<string, EditorNode>,
  ids: RegCascadeIDs[],
  from: string | undefined,
  to: string | undefined
) {
  const newElms = { ...elms };
  for (const item of ids) {
    switch (item.type) {
      case 'process': {
        const elm = { ...newElms[item.id] };
        if (isEditorProcess(elm)) {
          for (const att of item.attributes) {
            elm[att] = setReplace(elm[att], from, to);
          }
          newElms[item.id] = elm;
        }
        break;
      }
      case 'dc': {
        const elm = { ...newElms[item.id] };
        if (isEditorDataClass(elm)) {
          const newAtt = { ...elm.attributes };
          for (const [id, value] of item.attributes) {
            newAtt[id].type = value;
          }
          const rdcs = new Set([...elm.rdcs]);
          for (const [oldid, newid] of item.rdcs) {
            if (oldid !== '') {
              rdcs.delete(oldid);
            }
            if (newid !== '') {
              rdcs.add(newid);
            }
          }
          elm.rdcs = rdcs;
          elm.attributes = newAtt;
          newElms[item.id] = elm;
        }
        break;
      }
      case 'other': {
        const elm = { ...newElms[item.id] };
        if (isEditorApproval(elm)) {
          elm.records = setReplace(elm.records, from, to);
          newElms[item.id] = elm;
        }
        break;
      }
    }
  }
  return newElms;
}

export function regPageReplace(
  pages: Record<string, EditorSubprocess>,
  ids: [string, number, number][],
  from: string | undefined,
  to: string | undefined
): Record<string, EditorSubprocess> {
  const newPages = { ...pages };
  for (const [id, x, y] of ids) {
    const page = { ...newPages[id] };
    const newData = { ...page.data };
    if (from) {
      delete newData[from];
    }
    if (to) {
      newData[to] = {
        element: to,
        datatype: DataType.SUBPROCESSCOMPONENT,
        x,
        y,
      };
    }
    page.data = newData;
    newPages[id] = page;
  }
  return newPages;
}
