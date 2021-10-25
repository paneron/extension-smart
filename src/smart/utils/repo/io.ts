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

export enum RepoFileType {
  MODEL = 'model',
  MAP = 'map',
}

export function getPathByNS(ns: string, type: RepoFileType) {
  return `/${type}/${ns}.json`;
}

export function MMELToSerializable(m: MMELModel): MMELJSON {
  return {
    ...m,
    provisions: convertProvisions(m.provisions),
    notes: convertNotes(m.notes),
    elements: convertElements(m.elements),
  };
}

export function JSONToMMEL(m: MMELJSON): MMELModel {
  return {
    ...m,
    provisions: recoverProvisions(m.provisions),
    notes: recoverNotes(m.notes),
    elements: recoverElements(m.elements),
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
      ...p,
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
      ...p,
      records: [...p.records],
      ref: [...p.ref],
    };
    return x;
  } else if (isMMELDataClass(p)) {
    const x: JSONDataclass = {
      ...p,
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
      ...p,
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
      ...p,
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
