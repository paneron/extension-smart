import {
  isMMELApproval,
  isMMELDataClass,
  isMMELProcess,
} from '../../model/editormodel';
import {
  isJSONApproval,
  isJSONDataClass,
  isJSONProcess,
  JSONApproval,
  JSONDataAttribute,
  JSONDataclass,
  JSONNote,
  JSONProcess,
  JSONProvision,
  MMELJSON,
} from '../../model/json';
import { MMELNode } from '../../serialize/interface/baseinterface';
import {
  MMELDataAttribute,
  MMELDataClass,
} from '../../serialize/interface/datainterface';
import { MMELModel } from '../../serialize/interface/model';
import {
  MMELApproval,
  MMELProcess,
} from '../../serialize/interface/processinterface';
import {
  MMELNote,
  MMELProvision,
} from '../../serialize/interface/supportinterface';
import { createMetaData } from '../EditorFactory';

export enum RepoFileType {
  MODEL = 'model',
  MAP = 'map',
  WORKSPACE = 'workspace',
  RDF = 'rdf',
}

export const JSONContext = 'https://bsi-ribose-smart.org';
export const COMMITMSG = 'Update by Paneron';
export type JSONContextType = typeof JSONContext;

export function getPathByNS(ns: string, type: RepoFileType) {
  return `/${type}/${ns}.json`;
}

export function MMELToSerializable(m: MMELModel): MMELJSON {
  return {
    '@context': JSONContext,
    '@type': 'MMEL_SMART',
    meta: m.meta,
    roles: m.roles,
    refs: m.refs,
    enums: m.enums,
    vars: m.vars,
    pages: m.pages,
    views: m.views,
    terms: m.terms,
    tables: m.tables,
    figures: m.figures,
    sections: m.sections,
    links: m.links,
    root: m.root,
    provisions: convertProvisions(m.provisions),
    notes: convertNotes(m.notes),
    elements: convertElements(m.elements),
  };
}

export function JSONToMMEL(m: MMELJSON): MMELModel {
  return {
    meta: createMetaData(),
    roles: {},
    refs: {},
    enums: {},
    vars: {},
    pages: {},
    views: {},
    terms: {},
    tables: {},
    figures: {},
    sections: {},
    links: {},
    root: '',
    ...m,
    provisions: m.provisions ? recoverProvisions(m.provisions) : {},
    notes: m.notes ? recoverNotes(m.notes) : {},
    elements: m.elements ? recoverElements(m.elements) : {},
  };
}

function convertElements(
  elms: Record<string, MMELNode>
): Record<string, MMELNode> {
  const newElm: Record<string, MMELNode> = {};
  for (const [k, p] of Object.entries(elms)) {
    newElm[k] = convertElement(p);
  }
  return newElm;
}

function convertElement(p: MMELNode): MMELNode {
  if (isMMELProcess(p)) {
    const x: JSONProcess = {
      id: p.id,
      name: p.name,
      modality: p.modality,
      actor: p.actor,
      page: p.page,
      measure: p.measure,
      datatype: p.datatype,
      links: [...p.links],
      input: [...p.input],
      output: [...p.output],
      provision: [...p.provision],
      notes: [...p.notes],
      tables: [...p.tables],
      figures: [...p.figures],
    };
    return x;
  } else if (isMMELApproval(p)) {
    const x: JSONApproval = {
      id: p.id,
      name: p.name,
      modality: p.modality,
      actor: p.actor,
      approver: p.approver,
      datatype: p.datatype,
      records: [...p.records],
      ref: [...p.ref],
    };
    return x;
  } else if (isMMELDataClass(p)) {
    const x: JSONDataclass = {
      id: p.id,
      datatype: p.datatype,
      attributes: convertAttributes(p.attributes),
    };
    return x;
  } else {
    return p;
  }
}

function convertAttributes(
  att: Record<string, MMELDataAttribute>
): Record<string, JSONDataAttribute> {
  const newAtt: Record<string, JSONDataAttribute> = {};
  for (const [k, x] of Object.entries(att)) {
    newAtt[k] = {
      ...x,
      ref: [...x.ref],
      satisfy: [...x.satisfy],
    };
  }
  return newAtt;
}

function convertNotes(
  notes: Record<string, MMELNote>
): Record<string, JSONNote> {
  const newNote: Record<string, JSONNote> = {};
  for (const [k, p] of Object.entries(notes)) {
    newNote[k] = {
      id: p.id,
      type: p.type,
      message: p.message,
      datatype: p.datatype,
      ref: [...p.ref],
    };
  }
  return newNote;
}

function convertProvisions(
  pro: Record<string, MMELProvision>
): Record<string, JSONProvision> {
  const newPro: Record<string, JSONProvision> = {};
  for (const [k, p] of Object.entries(pro)) {
    newPro[k] = {
      subject: p.subject,
      id: p.id,
      modality: p.modality,
      condition: p.condition,
      datatype: p.datatype,
      ref: [...p.ref],
    };
  }
  return newPro;
}

function recoverElements(
  elms: Record<string, MMELNode>
): Record<string, MMELNode> {
  const newElm: Record<string, MMELNode> = {};
  for (const [k, p] of Object.entries(elms)) {
    newElm[k] = recoverElement(p);
  }
  return newElm;
}

function recoverElement(p: MMELNode): MMELNode {
  if (isJSONProcess(p)) {
    const x: MMELProcess = {
      ...p,
      input: new Set(p.input),
      output: new Set(p.output),
      provision: new Set(p.provision),
      links: new Set(p.links),
      notes: new Set(p.notes),
      tables: new Set(p.tables),
      figures: new Set(p.figures),
    };
    return x;
  } else if (isJSONApproval(p)) {
    const x: MMELApproval = {
      ...p,
      records: new Set(p.records),
      ref: new Set(p.ref),
    };
    return x;
  } else if (isJSONDataClass(p)) {
    const x: MMELDataClass = {
      ...p,
      attributes: recoverAttributes(p.attributes),
    };
    return x;
  } else {
    return p;
  }
}

function recoverAttributes(
  att: Record<string, JSONDataAttribute>
): Record<string, MMELDataAttribute> {
  const newAtt: Record<string, MMELDataAttribute> = {};
  for (const [k, x] of Object.entries(att)) {
    newAtt[k] = {
      ...x,
      ref: new Set(x.ref),
      satisfy: new Set(x.satisfy),
    };
  }
  return newAtt;
}

function recoverNotes(
  notes: Record<string, JSONNote>
): Record<string, MMELNote> {
  const newNote: Record<string, MMELNote> = {};
  for (const [k, p] of Object.entries(notes)) {
    newNote[k] = {
      ...p,
      ref: new Set(p.ref),
    };
  }
  return newNote;
}

function recoverProvisions(
  pro: Record<string, JSONProvision>
): Record<string, MMELProvision> {
  const newPro: Record<string, MMELProvision> = {};
  for (const [k, p] of Object.entries(pro)) {
    newPro[k] = {
      ...p,
      ref: new Set(p.ref),
    };
  }
  return newPro;
}
