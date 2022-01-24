import { DataType } from '../../../../serialize/interface/baseinterface';
import { MMELSubprocess } from '../../../../serialize/interface/flowcontrolinterface';
import { isRegistry } from '../../../../serialize/util/validation';
import { createRegistry } from '../../../../utils/EditorFactory';
import {
  fillRDCS,
  genDCIdByRegId,
  getReferenceDCTypeName,
  setReplace,
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
import { ElmAction, DataCascadeIDs } from '../elements';

export type RegistryCombined = EditorDataClass & {
  title: string;
};

/**
 * Handle the command to delete registry
 * @param elms The elements in the model
 * @param ids The IDs of registries to be deleted
 * @returns The updated elements in the model
 */
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

/**
 * Handle the command to add registries
 * @param elms The elements in the model
 * @param regs The new regsitry objects to be added
 * @returns The updtaed elements in the model
 */
export function addRegistry(
  elms: Record<string, EditorNode>,
  regs: EditorNode[]
): Record<string, EditorNode> {
  for (const item of regs) {
    const reg = item as RegistryCombined;
    const dcid = genDCIdByRegId(reg.id);
    const newreg = createRegistry(reg.id);
    const newdc = getDCFromCombined(dcid, reg);
    newreg.data = dcid;
    newreg.title = reg.title;
    elms[reg.id] = newreg;
    elms[dcid] = newdc;
    fillRDCS(newdc, elms);
  }
  return elms;
}

/**
 * Handle the command to edit a registry
 * @param elms The elements in the model
 * @param id The ID of the registry to be edited
 * @param item The updated content of the registry
 * @returns The updated elements in the model
 */
export function editRegistry(
  elms: Record<string, EditorNode>,
  id: string,
  item: RegistryCombined
): Record<string, EditorNode> {
  const old = elms[id];
  if (isEditorRegistry(old)) {
    delete elms[id];
    delete elms[old.data];
    const dcid = genDCIdByRegId(item.id);
    const newreg = createRegistry(item.id);
    const newdc = getDCFromCombined(dcid, item);
    newreg.data = dcid;
    newreg.title = item.title;
    elms[item.id] = newreg;
    elms[dcid] = newdc;
    fillRDCS(newdc, elms);
  }
  return elms;
}

/**
 * Examine the registry action and add cascade actions
 * @param elms The elements in the model
 * @param pages The pages in the model
 * @param action The action
 * @returns The cascade actions for undo
 */
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
    const dcs = action.value.map(x => genDCIdByRegId(x));
    const affected: [DataCascadeIDs[], [string, number, number][], string][] =
      action.value.map(x => {
        const [ids, pids] = findAffectedElements(elms, pages, x, '', '');
        const fids = ids.filter(x => !dcs.includes(x.id));
        return [fids, pids, x];
      });
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
        subtask: 'data',
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
        ids: ids.map(x => reverseAttribute(x, elms)),
      },
      {
        type: 'model',
        act: 'pages',
        task: 'cascade',
        subtask: 'data',
        from: undefined,
        to: id,
        ids: pids,
      },
    ]);
  } else if (action.task === 'edit') {
    const regid = action.value.id;
    const dcid = genDCIdByRegId(regid);
    if (action.id !== regid) {
      action.value = replaceSelf(
        action.id,
        dcid,
        action.value as RegistryCombined,
        elms
      );
    }
    const [ids, pids] = findAffectedElements(
      elms,
      pages,
      action.id,
      action.value.id,
      dcid
    );
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
        subtask: 'data',
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
        ids: ids.map(x =>
          reverseAttribute(x, elms, genDCIdByRegId(action.id), dcid)
        ),
      },
      {
        type: 'model',
        act: 'pages',
        task: 'cascade',
        subtask: 'data',
        to: action.id,
        from: action.value.id,
        ids: pids,
      },
    ];
  }
  return [];
}

/**
 * Internal function to find the affected components to be handled in the cascade actions
 */
function findAffectedElements(
  elms: Record<string, EditorNode>,
  pages: Record<string, MMELSubprocess>,
  id: string,
  newreg: string,
  newdcid: string
): [DataCascadeIDs[], [string, number, number][]] {
  const ids: DataCascadeIDs[] = [];
  const pids: [string, number, number][] = [];
  const reg = elms[id];
  if (isRegistry(reg)) {
    const dcid = reg.data;
    const oldrefid = getReferenceDCTypeName(id);
    const newrefid = getReferenceDCTypeName(newreg);
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
      } else if (isEditorDataClass(elm) && x !== dcid) {
        if (elm.rdcs.has(dcid)) {
          const rdcs: [string, string][] = [[dcid, newdcid]];
          const attributes: [string, string][] = [];
          for (const a in elm.attributes) {
            const att = elm.attributes[a];
            if (att.type === dcid) {
              attributes.push([a, newreg]);
            } else if (att.type === oldrefid) {
              attributes.push([a, newrefid]);
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
      if (data) {
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
    objectVersion: reg.objectVersion,
    rdcs: new Set([...reg.rdcs]),
    mother: reg.id,
  };
}

function reverseAttribute(
  item: DataCascadeIDs,
  elms: Record<string, EditorNode>,
  dcid?: string,
  newdcid?: string
): DataCascadeIDs {
  switch (item.type) {
    case 'dc': {
      const dc = elms[item.id];
      if (isEditorDataClass(dc)) {
        return {
          id: dcid !== undefined && item.id === dcid ? newdcid ?? '' : item.id,
          type: 'dc',
          attributes: item.attributes.map(([aid]) => [
            aid,
            dc.attributes[aid].type,
          ]),
          rdcs: item.rdcs.map(([a, b]) => [b, a]),
        };
      }
      break;
    }
  }
  return item;
}

function replaceSelf(
  id: string,
  newDCid: string,
  value: RegistryCombined,
  elms: Record<string, EditorNode>
): RegistryCombined {
  const attributes = { ...value.attributes };
  const oldrefid = getReferenceDCTypeName(id);
  const newrefid = getReferenceDCTypeName(value.id);
  const reg = elms[id];
  if (isEditorRegistry(reg)) {
    let found = false;
    for (const x in attributes) {
      const a = attributes[x];
      if (a.type === oldrefid) {
        attributes[x] = { ...a, type: newrefid };
        found = true;
      }
    }
    if (found) {
      const retValue = { ...value, attributes };
      retValue.rdcs = setReplace(value.rdcs, reg.data, newDCid);
    }
  }
  return value;
}
