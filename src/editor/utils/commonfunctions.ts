import {
  EditorDataClass,
  EditorNode,
  isEditorDataClass,
} from '../model/editormodel';
import { MMELObject } from '../serialize/interface/baseinterface';
import { MMELReference } from '../serialize/interface/supportinterface';
import { IListItem } from '../ui/common/fields';

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
  return r.document + ' (' + r.clause + ')';
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
      const numB = partsA[index];
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

export function findUniqueID(prefix: string, ids: Record<string, MMELObject>) {
  let num = 1;
  let name = prefix + num;
  while (ids[name] !== undefined) {
    num++;
    name = prefix + num;
  }
  return name;
}
