import {
  EditorDataClass,
  EditorModel,
  EditorNode,
  EditorSubprocess,
  isEditorDataClass,
  isEditorRegistry,
} from '../model/editormodel';
import { MMELObject } from '../serialize/interface/baseinterface';
import { MMELReference } from '../serialize/interface/supportinterface';
import { IListItem } from '../ui/common/fields';

// temp class for debug, global console logger
export class Logger {
  static logger: { log: (...args: any[]) => void };
}

export function replaceSet(
  set: Set<string>,
  matchid: string,
  replaceid: string
) {
  if (set.has(matchid)) {
    set.delete(matchid);
    if (replaceid !== '') {
      set.add(replaceid);
    }
  }
}

export function toRefSummary(r: MMELReference): string {
  if (r.clause === '') {
    return r.document;
  }
  return r.document + ' (' + r.clause + ')' + (r.title ? ' : ' + r.title:'');
}

export function genDCIdByRegId(id: string) {
  return id + '#data';
}

export function getReferenceDCTypeName(dcid: string) {
  if (dcid === '') {
    return '';
  }
  return 'reference(' + dcid + ')';
}

export function fillRDCS(
  data: EditorDataClass,
  elements: Record<string, EditorNode>
) {
  data.rdcs.clear();
  for (const a in data.attributes) {
    const att = data.attributes[a];
    let type = att.type;
    const i1 = type.indexOf('(');
    const i2 = type.indexOf(')');
    if (i1 !== -1 && i2 !== -1) {
      type = type.substr(i1 + 1, i2 - i1 - 1);
    }
    if (type !== '') {
      const ret = elements[type];
      if (ret !== undefined && isEditorDataClass(ret)) {
        data.rdcs.add(type);
      }
    }
  }
}

export function referenceSorter(a: MMELReference, b: MMELReference): number {
  if (a.document === b.document) {
    const partsA = a.clause.split('.');
    const partsB = b.clause.split('.');
    let index = 0;
    while (index < partsA.length && index < partsB.length) {
      const numA = partsA[index];
      const numB = partsB[index];
      if (numA === numB) {
        index++;
      } else {
        const xA = Number(numA);
        const xB = Number(numB);
        if (isNaN(xA) || isNaN(xB)) {
          return numA.localeCompare(numB);
        } else {
          return xA - xB;
        }
      }
    }
    return partsA.length - partsB.length;
  }
  return a.document.localeCompare(b.document);
}

export function checkId(id: string, ids: Record<string, any>): boolean {
  if (id === '') {
    alert('New ID is empty');
    return false;
  }
  if (ids[id] !== undefined) {
    alert('New ID already exists');
    return false;
  }
  return true;
}

export function defaultItemSorter(a: IListItem, b: IListItem): number {
  return a.id.localeCompare(b.id);
}

export function removeSpace(id: string) {
  return id.replaceAll(/\s+/g, '');
}

export function findUniqueID(prefix: string, ids: Record<string, MMELObject>) {
  let num = 1;
  let name = prefix + num;
  while (ids[name] !== undefined) {
    num++;
    name = prefix + num;
  }
  return name;
}

export function updatePageElement(
  page: EditorSubprocess,
  oldId: string,
  node: EditorNode
) {
  const newId = node.id;
  const elm = page.childs[oldId];
  if (elm !== undefined) {
    delete page.childs[oldId];
    page.childs[newId] = elm;
    elm.element = node.id;
    for (const e in page.edges) {
      const edge = page.edges[e];
      if (edge.from === oldId) {
        edge.from = newId;
      }
      if (edge.to === oldId) {
        edge.to = newId;
      }
    }
    node.pages.add(page.id);
  }
}

export function getModelAllRolesWithEmpty(model: EditorModel): string[] {
  return [''].concat(
    Object.values(model.roles)
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(r => r.id)
  );
}

export function getModelAllRegs(model: EditorModel): string[] {
  return Object.values(model.elements)
    .filter(x => isEditorRegistry(x))
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(r => r.id);
}

export function getModelAllRefs(model: EditorModel): string[] {
  return Object.values(model.refs)
    .sort(referenceSorter)
    .map(r => r.id);
}

export function getModelAllMeasures(model: EditorModel): string[] {
  return Object.values(model.vars)
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(r => r.id);
}

export function getModelAllSignals(model: EditorModel): string[] {
  return Object.values(model.elements)
    .filter(x => isEditorRegistry(x))
    .sort((a, b) => a.id.localeCompare(b.id))
    .flatMap(r => [r.id + 'CREATED', r.id + 'UPDATED', r.id + 'DELETED']);
}
