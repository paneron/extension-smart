import { DataType } from '../../../../serialize/interface/baseinterface';
import { MMELSubprocess } from '../../../../serialize/interface/flowcontrolinterface';
import { isRegistry } from '../../../../serialize/util/validation';
import { createRegistry } from '../../../../utils/EditorFactory';
import {
  fillRDCS,
  genDCIdByRegId,
  getReferenceDCTypeName,
} from '../../../../utils/ModelFunctions';
import {
  EditorDataClass,
  EditorNode,
  isEditorApproval,
  isEditorDataClass,
  isEditorProcess,
  isEditorRegistry,
} from '../../../editormodel';
import { ModelAction } from '../../model';
import { ElmAction, RegCascadeIDs } from '../elements';

export type RegistryCombined = EditorDataClass & {
  title: string;
};

export function delRegistry(
  elms: Record<string, EditorNode>,
  ids: string[]
): Record<string, EditorNode> {
  for (const id of ids) {
    const reg = elms[id];
    if (isEditorRegistry(reg)) {
      delete elms[id];
      delete elms[reg.data];
    }
  }
  return elms;
}

export function addRegistry(
  elms: Record<string, EditorNode>,
  regs: EditorNode[]
): Record<string, EditorNode> {
  const newElms = { ...elms };
  for (const item of regs) {
    const reg = item as RegistryCombined;
    const dcid = genDCIdByRegId(reg.id);
    const newreg = createRegistry(reg.id);
    const newdc = getDCFromCombined(dcid, reg);
    newreg.data = dcid;
    newreg.title = reg.title;
    newElms[reg.id] = newreg;
    newElms[dcid] = newdc;
    fillRDCS(newdc, newElms);
  }
  return newElms;
}

export function editRegistry(
  elms: Record<string, EditorNode>,
  id: string,
  item: EditorNode
): Record<string, EditorNode> {
  const newElms = { ...elms };
  const old = newElms[id];
  if (isEditorRegistry(old)) {
    delete newElms[id];
    delete newElms[old.data];
    const reg = item as RegistryCombined;
    const dcid = genDCIdByRegId(reg.id);
    const newreg = createRegistry(reg.id);
    const newdc = getDCFromCombined(dcid, reg);
    newreg.data = dcid;
    newreg.title = reg.title;
    newElms[reg.id] = newreg;
    newElms[dcid] = newdc;
    fillRDCS(newdc, newElms);
  }
  return newElms;
}

export function cascadeCheckRegs(
  elms: Record<string, EditorNode>,
  pages: Record<string, MMELSubprocess>,
  action: ElmAction & {
    act: 'elements';
    subtask: 'registry';
  }
): ModelAction[] | undefined {
  if (action.cascade) {
    return undefined;
  }
  if (action.task === 'delete') {
    const affected: [RegCascadeIDs[], [string, number, number][], string][] =
      action.value.map(x => [...findAffectedElements(elms, pages, x, ''), x]);
    action.cascade = affected.flatMap(([ids, pids, id]) => [
      {
        type: 'model',
        act: 'elements',
        task: 'cascade',
        subtask: 'process-reg',
        to: undefined,
        from: id,
        ids,
      },
      {
        type: 'model',
        act: 'pages',
        task: 'cascade',
        subtask: 'process-reg',
        to: undefined,
        from: id,
        ids: pids,
      },
    ]);
    return affected.flatMap(([ids, pids, id]) => [
      {
        type: 'model',
        act: 'elements',
        task: 'cascade',
        subtask: 'process-reg',
        from: undefined,
        to: id,
        ids: ids,
      },
      {
        type: 'model',
        act: 'pages',
        task: 'cascade',
        subtask: 'process-reg',
        from: undefined,
        to: id,
        ids: pids,
      },
    ]);
  } else if (action.task === 'edit') {
    const regid = action.value.id;
    const dcid = genDCIdByRegId(regid);
    const [ids, pids] = findAffectedElements(elms, pages, action.id, dcid);
    action.cascade = [
      {
        type: 'model',
        act: 'elements',
        task: 'cascade',
        subtask: 'process-reg',
        from: action.id,
        to: action.value.id,
        ids,
      },
      {
        type: 'model',
        act: 'pages',
        task: 'cascade',
        subtask: 'process-reg',
        from: action.id,
        to: action.value.id,
        ids: pids,
      },
    ];
    return [
      {
        type: 'model',
        act: 'elements',
        task: 'cascade',
        subtask: 'process-reg',
        to: action.id,
        from: action.value.id,
        ids,
      },
      {
        type: 'model',
        act: 'pages',
        task: 'cascade',
        subtask: 'process-reg',
        to: action.id,
        from: action.value.id,
        ids: pids,
      },
    ];
  }
  return [];
}

function findAffectedElements(
  elms: Record<string, EditorNode>,
  pages: Record<string, MMELSubprocess>,
  id: string,
  newdc: string
): [RegCascadeIDs[], [string, number, number][]] {
  const ids: RegCascadeIDs[] = [];
  const pids: [string, number, number][] = [];
  const reg = elms[id];
  if (isRegistry(reg)) {
    const dcid = reg.data;
    const oldrefdcid = getReferenceDCTypeName(dcid);
    const newrefdcid = getReferenceDCTypeName(newdc);
    for (const x in elms) {
      const elm = elms[x];
      if (isEditorProcess(elm)) {
        const match: ('input' | 'output')[] = [];
        if (elm.input.has(id)) {
          match.push('input');
        }
        if (elm.output.has(id)) {
          match.push('output');
        }
        if (match.length > 0) {
          ids.push({
            id: x,
            type: 'process',
            attributes: match,
          });
        }
      } else if (isEditorApproval(elm)) {
        if (elm.records.has(id)) {
          ids.push({
            id: x,
            type: 'other',
          });
        }
      } else if (isEditorDataClass(elm)) {
        if (elm.rdcs.has(dcid)) {
          const rdcs: [string, string][] = [[dcid, newdc]];
          const attributes: [string, string][] = [];
          for (const a in elm.attributes) {
            const att = elm.attributes[a];
            if (att.type === dcid) {
              attributes.push([a, newdc]);
            } else if (att.type === oldrefdcid) {
              attributes.push([a, newrefdcid]);
            }
          }
          ids.push({
            id: x,
            type: 'dc',
            attributes,
            rdcs,
          });
        }
      }
    }
    for (const p in pages) {
      const page = pages[p];
      const data = page.data[id];
      if (data !== undefined) {
        pids.push([p, data.x, data.y]);
      }
    }
  }
  return [ids, pids];
}

function getDCFromCombined(
  dcid: string,
  reg: RegistryCombined
): EditorDataClass {
  return {
    attributes: { ...reg.attributes },
    id: dcid,
    datatype: DataType.DATACLASS,
    added: reg.added,
    pages: reg.pages,
    objectVersion: reg.objectVersion,
    rdcs: new Set([...reg.rdcs]),
    mother: reg.id,
  };
}
