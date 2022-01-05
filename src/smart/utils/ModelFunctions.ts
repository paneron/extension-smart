import {
  EditorDataClass,
  EditorModel,
  EditorNode,
  EditorRegistry,
  EditorSubprocess,
  isEditorDataClass,
  isEditorRegistry,
} from '../model/editormodel';
import { MMELObject } from '../serialize/interface/baseinterface';
import {
  MMELEdge,
  MMELSubprocess,
} from '../serialize/interface/flowcontrolinterface';
import {
  MMELMetadata,
  MMELReference,
  MMELRole,
} from '../serialize/interface/supportinterface';
import { IListItem } from '../ui/common/fields';

const TypeReferenceHead = 'reference(';
const TypeReferenceTail = ')';

// temp class for debug, global console logger
export class Logger {
  static log: (...args: unknown[]) => void;
}

export function isSpace(x: string): boolean {
  return /\s/.test(x);
}

export function getRootName(meta: MMELMetadata): string {
  if (meta.shortname !== '') {
    return meta.shortname;
  }
  if (meta.namespace !== '') {
    return meta.namespace;
  }
  return 'root';
}

export function getNamespace(model: EditorModel): string {
  return model.meta.namespace === '' ? 'defaultns' : model.meta.namespace;
}

/**
 * Deprecated, use setReplace instead
 * @param set
 * @param matchid
 * @param replaceid
 */
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

export function setReplace(
  set: Set<string>,
  matchid: string | undefined,
  replaceid: string | undefined
) {
  const newSet = new Set([...set]);
  if (matchid && newSet.has(matchid)) {
    newSet.delete(matchid);
  }
  if (replaceid) {
    newSet.add(replaceid);
  }
  return newSet;
}

export function toRefSummary(r: MMELReference): string {
  if (r.clause === '') {
    return r.document;
  }
  return (
    r.clause +
    (r.title ? ' : ' + r.title : '') +
    (r.document !== '' ? ` (${r.document})` : '')
  );
}

export function genDCIdByRegId(id: string) {
  return id + '#data';
}

export function getReferenceDCTypeName(dcid: string) {
  if (dcid === '') {
    return '';
  }
  return TypeReferenceHead + dcid + TypeReferenceTail;
}

export function getRegistryReference(
  type: string,
  elements: Record<string, EditorNode>
): EditorRegistry | null {
  if (type.length <= TypeReferenceTail.length + TypeReferenceHead.length) {
    return null;
  }
  const head = type.substring(0, TypeReferenceHead.length);
  const content = type.substring(
    TypeReferenceHead.length,
    type.length - TypeReferenceTail.length
  );
  const tail = type.substring(type.length - TypeReferenceTail.length);
  if (head === TypeReferenceHead && tail === TypeReferenceTail) {
    const reg = elements[content];
    if (reg !== undefined && isEditorRegistry(reg)) {
      return reg;
    }
  }
  return null;
}

export function fillRDCS(
  data: EditorDataClass,
  elements: Record<string, EditorNode>
) {
  data.rdcs.clear();
  for (const a in data.attributes) {
    const att = data.attributes[a];
    const dc = elements[att.type];
    if (dc !== undefined && isEditorDataClass(dc)) {
      data.rdcs.add(dc.id);
    } else {
      const reg = getRegistryReference(att.type, elements);
      if (reg !== null) {
        data.rdcs.add(reg.data);
      }
    }
  }
}

export function clauseSorter(a: string, b: string): number {
  const partsA = a.split('.');
  const partsB = b.split('.');
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

export function referenceSorter(a: MMELReference, b: MMELReference): number {
  if (a.document === b.document) {
    return clauseSorter(a.clause, b.clause);
  }
  return a.document.localeCompare(b.document);
}

export function buildEdgeConnections(
  page: MMELSubprocess
): Record<string, MMELEdge[]> {
  const result: Record<string, MMELEdge[]> = {};
  Object.values(page.edges).forEach(e => {
    if (result[e.from] === undefined) {
      result[e.from] = [];
    }
    result[e.from].push(e);
  });
  return result;
}

export function checkId(
  id: string,
  ids: Record<string, unknown>,
  isRegistryData = false
): boolean {
  if (id === '') {
    alert('New ID is empty');
    return false;
  }
  if (!isRegistryData && id.includes('#')) {
    alert('New ID contains symbols #');
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

export function defaultItemSorterAsNum(a: IListItem, b: IListItem): number {
  return parseInt(a.id) - parseInt(b.id);
}

export function itemSorterByText(a: IListItem, b: IListItem): number {
  return a.text.localeCompare(b.text);
}

export function removeSpace(id: string) {
  return id.replaceAll(/\s+/g, '');
}

export function parseCardinality(text: string): [string, string] {
  const index = text.indexOf('..');
  const low = index === -1 ? '' : text.substring(0, index);
  const high = index === -1 ? '' : text.substring(index + 2);
  return [low, high];
}

export function cardinalityToString(low: string, high: string): string {
  return `${low}..${high}`;
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

function capital(data: string): string {
  return capital.length > 0 ? data[0].toUpperCase() + data.slice(1) : '';
}

export function capitalizeString(data: string): string {
  const parts = data.split(/\s+/);
  return parts.map(x => capital(x)).join('');
}

export function trydefaultID(name: string, ids: Record<string, MMELObject>) {
  if (ids[name] !== undefined) {
    return findUniqueID(name, ids);
  }
  return name;
}

export function updatePageElement(
  page: EditorSubprocess,
  oldId: string,
  newId: string
) {
  page.childs = { ...page.childs };
  const elm = { ...page.childs[oldId], element: newId };
  delete page.childs[oldId];
  page.childs[newId] = elm;
  page.edges = { ...page.edges };
  for (const e in page.edges) {
    const edge = page.edges[e];
    if (edge.from === oldId) {
      page.edges[e] = { ...edge, from: newId };
    }
    if (edge.to === oldId) {
      page.edges[e] = { ...page.edges[e], to: newId };
    }
  }
}

export function getModelAllRoles(model: EditorModel): MMELRole[] {
  return Object.values(model.roles).sort((a, b) => a.id.localeCompare(b.id));
}

export function getModelAllRolesWithEmpty(model: EditorModel): string[] {
  return [''].concat(
    Object.values(model.roles)
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(r => r.id)
  );
}

export function getModelAllRegs(model: EditorModel): EditorRegistry[] {
  return Object.values(model.elements)
    .filter(x => isEditorRegistry(x))
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(x => x as EditorRegistry);
}

export function getModelAllRefs(model: EditorModel): MMELReference[] {
  return Object.values(model.refs).sort(referenceSorter);
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

export function buildModelLinks(model: EditorModel) {
  for (const p in model.pages) {
    const page = model.pages[p];
    const neighbor: Record<string, Set<string>> = {};
    Object.values(page.edges).forEach(e => {
      if (neighbor[e.from] === undefined) {
        neighbor[e.from] = new Set<string>();
      }
      neighbor[e.from].add(e.to);
    });
    page.neighbor = neighbor;
  }
}
