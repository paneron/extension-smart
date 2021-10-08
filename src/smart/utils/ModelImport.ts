import {
  EditorDataClass,
  EditorModel,
  EditorNode,
  EditorProcess,
  EditorRegistry,
  EditorSubprocess,
  isEditorDataClass,
  isEditorProcess,
  isEditorRegistry,
} from '../model/editormodel';
import { ModelWrapper } from '../model/modelwrapper';
import { DataType } from '../serialize/interface/baseinterface';
import { MMELDataAttribute } from '../serialize/interface/datainterface';
import {
  MMELEdge,
  MMELSubprocessComponent,
} from '../serialize/interface/flowcontrolinterface';
import {
  MMELNote,
  MMELProvision,
  MMELReference,
  MMELRole,
} from '../serialize/interface/supportinterface';
import {
  trydefaultID,
  getRegistryReference,
  getReferenceDCTypeName,
  findUniqueID,
} from './ModelFunctions';

export function addProcessIfNotFound(
  mw: ModelWrapper,
  ref: ModelWrapper,
  id: string,
  nameMap: Record<string, string>,
  refMap: Record<string, string>,
  roleMap: Record<string, string>,
  pageid: string
): EditorProcess {
  const rmodel = ref.model;
  const model = mw.model;
  if (nameMap[id] !== undefined) {
    return model.elements[nameMap[id]] as EditorProcess;
  }
  const newid = trydefaultID(id, model.elements);
  nameMap[id] = newid;

  const process = rmodel.elements[id] as EditorProcess;
  const actor =
    process.actor !== ''
      ? addRoleIfNotFound(mw, ref, process.actor, roleMap)
      : undefined;
  const outputs: EditorRegistry[] = [];
  process.output.forEach(x => {
    outputs.push(addRegistryIfNotFound(mw, ref, x, nameMap, refMap, pageid));
  });
  const inputs: EditorRegistry[] = [];
  process.input.forEach(x => {
    inputs.push(addRegistryIfNotFound(mw, ref, x, nameMap, refMap, pageid));
  });
  const pros: string[] = [];
  process.provision.forEach(p =>
    pros.push(addProvision(mw, ref, rmodel.provisions[p], refMap))
  );
  const ns: string[] = [];
  process.notes.forEach(n =>
    ns.push(addNote(mw, ref, rmodel.notes[n], refMap))
  );
  const newPage =
    process.page !== ''
      ? addPageIfNotFound(mw, ref, process.page, nameMap, refMap, roleMap)
      : undefined;
  for (const x of process.measure) {
    addMeasureIfNotFound(mw.model, ref.model, x);
  }

  const newProcess: EditorProcess = {
    id: newid,
    name: process.name,
    modality: process.modality,
    actor: actor !== undefined ? actor.id : '',
    output: new Set(outputs.map(o => o.id)),
    input: new Set(inputs.map(o => o.id)),
    provision: new Set(pros),
    notes: new Set(ns),
    page: newPage !== undefined ? newPage.id : '',
    datatype: DataType.PROCESS,
    measure: [...process.measure], // not done yet
    added: false,
    pages: new Set<string>([pageid]),
    objectVersion: 'Editor',
  };
  model.elements[newid] = newProcess;
  return newProcess;
}

function addComponentIfNotFound(
  mw: ModelWrapper,
  ref: ModelWrapper,
  id: string,
  nameMap: Record<string, string>,
  refMap: Record<string, string>,
  roleMap: Record<string, string>,
  pageid: string
): EditorNode {
  const rmodel = ref.model;
  const model = mw.model;

  const elm = rmodel.elements[id];
  if (isEditorProcess(elm)) {
    return addProcessIfNotFound(
      mw,
      ref,
      elm.id,
      nameMap,
      refMap,
      roleMap,
      pageid
    );
  }
  if (isEditorDataClass(elm)) {
    return addDCIfNotFound(mw, ref, id, nameMap, refMap, pageid);
  }
  if (isEditorRegistry(elm)) {
    return addRegistryIfNotFound(mw, ref, id, nameMap, refMap, pageid);
  }
  const newid = trydefaultID(id, model.elements);
  nameMap[id] = newid;
  const newElm = { ...elm, id: newid, pages: new Set([pageid]) };
  model.elements[newid] = newElm;
  return newElm;
}

function addPageIfNotFound(
  mw: ModelWrapper,
  ref: ModelWrapper,
  id: string,
  nameMap: Record<string, string>,
  refMap: Record<string, string>,
  roleMap: Record<string, string>
): EditorSubprocess {
  const rmodel = ref.model;
  const model = mw.model;

  const page = rmodel.pages[id];

  const newid = findUniqueID('Page', mw.model.pages);
  const newPage: EditorSubprocess = {
    id: newid,
    childs: {},
    data: {},
    edges: {},
    datatype: DataType.SUBPROCESS,
    start: nameMap[page.start],
    neighbor: {},
    objectVersion: 'Editor',
  };
  model.pages[newid] = newPage;

  const newChilds: Record<string, MMELSubprocessComponent> = {};
  Object.values(page.childs).forEach(c => {
    const newElm = addComponentIfNotFound(
      mw,
      ref,
      c.element,
      nameMap,
      refMap,
      roleMap,
      newid
    );
    newChilds[c.element] = {
      ...c,
      element: newElm.id,
    };
  });
  newPage.childs = newChilds;

  const newData: Record<string, MMELSubprocessComponent> = {};
  Object.values(page.data).forEach(c => {
    const newElm = addComponentIfNotFound(
      mw,
      ref,
      c.element,
      nameMap,
      refMap,
      roleMap,
      newid
    );
    newData[c.element] = {
      ...c,
      element: newElm.id,
    };
  });
  newPage.data = newData;

  const newEdges: Record<string, MMELEdge> = {};
  Object.values(page.edges).forEach(e => {
    addMeasureIfNotFound(model, rmodel, e.condition);
    newEdges[e.id] = {
      ...e,
      from: nameMap[e.from],
      to: nameMap[e.to],
    };
  });
  newPage.edges = newEdges;

  const newNeighbor: Record<string, Set<string>> = {};
  Object.entries(page.neighbor).forEach(([from, tos]) => {
    const newSet: string[] = [];
    tos.forEach(x => {
      newSet.push(nameMap[x]);
    });
    newNeighbor[nameMap[from]] = new Set(newSet);
  });
  newPage.neighbor = newNeighbor;
  return newPage;
}

function addProvision(
  mw: ModelWrapper,
  ref: ModelWrapper,
  provision: MMELProvision,
  refMap: Record<string, string>
): string {
  const newid = findUniqueID('Provision', mw.model.provisions);
  const refs: string[] = [];
  provision.ref.forEach(r =>
    refs.push(addRefIfNotFound(mw, ref, r, refMap).id)
  );
  const newProvision: MMELProvision = {
    ...provision,
    id: newid,
    ref: new Set(refs),
  };
  mw.model.provisions[newid] = newProvision;
  return newid;
}

function addNote(
  mw: ModelWrapper,
  ref: ModelWrapper,
  note: MMELNote,
  refMap: Record<string, string>
): string {
  const newid = findUniqueID('Note', mw.model.notes);
  const refs: string[] = [];
  note.ref.forEach(r => refs.push(addRefIfNotFound(mw, ref, r, refMap).id));
  const newNote: MMELNote = {
    ...note,
    id: newid,
    ref: new Set(refs),
  };
  mw.model.notes[newid] = newNote;
  return newid;
}

function addRoleIfNotFound(
  mw: ModelWrapper,
  ref: ModelWrapper,
  id: string,
  roleMap: Record<string, string>
): MMELRole {
  const rmodel = ref.model;
  const model = mw.model;
  if (roleMap[id] !== undefined) {
    return model.roles[roleMap[id]];
  }

  const role = rmodel.roles[id];
  for (const r in model.roles) {
    const crole = model.roles[r];
    if (crole.name === role.name) {
      roleMap[id] = crole.id;
      return crole;
    }
  }

  const newid = trydefaultID(id, model.roles);
  roleMap[id] = newid;

  const newRole: MMELRole = {
    id: newid,
    name: role.name,
    datatype: DataType.ROLE,
  };
  model.roles[newid] = newRole;
  return newRole;
}

function addRegistryIfNotFound(
  mw: ModelWrapper,
  ref: ModelWrapper,
  id: string,
  nameMap: Record<string, string>,
  refMap: Record<string, string>,
  pageid: string
): EditorRegistry {
  const rmodel = ref.model;
  const model = mw.model;
  if (nameMap[id] !== undefined) {
    return model.elements[nameMap[id]] as EditorRegistry;
  }

  const reg = rmodel.elements[id] as EditorRegistry;
  for (const x in model.elements) {
    const creg = model.elements[x];
    if (isEditorRegistry(creg) && reg.title === creg.title) {
      const refdc = rmodel.elements[reg.data] as EditorDataClass;
      const cdc = model.elements[creg.data] as EditorDataClass;
      if (isSameSetAttributes(refdc.attributes, cdc.attributes)) {
        nameMap[id] = reg.id;
        return reg;
      }
    }
  }

  const newid = trydefaultID(id, model.elements);
  nameMap[id] = newid;

  const dc = addDCIfNotFound(mw, ref, reg.data, nameMap, refMap, pageid);
  const newReg: EditorRegistry = {
    id: newid,
    title: reg.title,
    data: dc.id,
    datatype: DataType.REGISTRY,
    added: false,
    pages: new Set<string>([pageid]),
    objectVersion: 'Editor',
  };
  model.elements[newid] = newReg;
  return newReg;
}

function addDCIfNotFound(
  mw: ModelWrapper,
  ref: ModelWrapper,
  id: string,
  nameMap: Record<string, string>,
  refMap: Record<string, string>,
  pageid: string
): EditorDataClass {
  const rmodel = ref.model;
  const model = mw.model;
  if (nameMap[id] !== undefined) {
    return model.elements[nameMap[id]] as EditorDataClass;
  }

  const dc = rmodel.elements[id] as EditorDataClass;
  const newid = trydefaultID(id, model.elements);
  nameMap[id] = newid;

  const attributes: Record<string, MMELDataAttribute> = {};
  Object.values(dc.attributes).forEach(refAtt => {
    const x: MMELDataAttribute = { ...refAtt };
    attributes[x.id] = x;
    const refs: string[] = [];
    x.ref.forEach(r => refs.push(addRefIfNotFound(mw, ref, r, refMap).id));
    x.ref = new Set(refs);

    const trydc = rmodel.elements[x.type];
    if (trydc !== undefined && isEditorDataClass(trydc)) {
      x.type = addDCIfNotFound(mw, ref, x.type, nameMap, refMap, pageid).id;
    } else {
      const reg = getRegistryReference(x.type, rmodel.elements);
      if (reg !== null) {
        x.type = getReferenceDCTypeName(
          addRegistryIfNotFound(mw, ref, x.type, nameMap, refMap, pageid).id
        );
      }
    }
  });
  const newrdcs: string[] = [];
  dc.rdcs.forEach(x => {
    newrdcs.push(nameMap[x]);
  });
  const newDC: EditorDataClass = {
    id: newid,
    attributes,
    datatype: DataType.DATACLASS,
    mother: dc.mother === '' ? '' : nameMap[dc.mother],
    rdcs: new Set(newrdcs),
    added: false,
    pages: new Set<string>([pageid]),
    objectVersion: 'Editor',
  };
  model.elements[newid] = newDC;
  return newDC;
}

function addRefIfNotFound(
  mw: ModelWrapper,
  ref: ModelWrapper,
  id: string,
  refMap: Record<string, string>
): MMELReference {
  const rmodel = ref.model;
  const model = mw.model;
  if (refMap[id] !== undefined) {
    return model.refs[refMap[id]];
  }

  const r = rmodel.refs[id];
  const existing = findExistingRef(model, r);
  if (existing !== null) {
    refMap[id] = existing.id;
    return existing;
  }

  const newid = trydefaultID(id, model.refs);
  refMap[id] = newid;

  const newRef: MMELReference = {
    id: newid,
    document: r.document,
    clause: r.clause,
    title: r.title,
    datatype: DataType.REFERENCE,
  };
  model.refs[newid] = newRef;
  return newRef;
}

const attKeys = ['modality', 'definition'] as const;

function isSameSetAttributes(
  att1: Record<string, MMELDataAttribute>,
  att2: Record<string, MMELDataAttribute>
): boolean {
  if (Object.values(att1).length !== Object.values(att2).length) {
    return false;
  }
  for (const x in att1) {
    const at1 = att1[x];
    const at2 = att2[x];
    if (at2 === undefined) {
      return false;
    }

    for (const y of attKeys) {
      if (at1[y] !== at2[y]) {
        return false;
      }
    }
  }
  return true;
}

function addMeasureIfNotFound(
  model: EditorModel,
  ref: EditorModel,
  expression: string
) {
  const results = Array.from(expression.matchAll(/\[.*?\]/g));
  for (const r of results) {
    const name = r[0].substring(1, r[0].length - 1);
    if (model.vars[name] === undefined && ref.vars[name] !== undefined) {
      model.vars[name] = { ...ref.vars[name] };
      addMeasureIfNotFound(model, ref, model.vars[name].definition);
    }
  }
}

export function findExistingRef(
  model: EditorModel,
  r: MMELReference,
  titleCheck = true
): MMELReference | null {
  for (const x in model.refs) {
    const ref = model.refs[x];
    if (
      (r.title === ref.title || !titleCheck) &&
      r.document === ref.document &&
      r.clause === ref.clause
    ) {
      return ref;
    }
  }
  return null;
}
