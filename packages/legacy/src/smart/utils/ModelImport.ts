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
import { DataType } from '../serialize/interface/baseinterface';
import { MMELDataAttribute } from '../serialize/interface/datainterface';
import {
  MMELEdge,
  MMELSubprocessComponent,
} from '../serialize/interface/flowcontrolinterface';
import {
  MMELFigure,
  MMELLink,
  MMELNote,
  MMELProvision,
  MMELReference,
  MMELRole,
  MMELTable,
  MMELVariable,
} from '../serialize/interface/supportinterface';
import {
  trydefaultID,
  getRegistryReference,
  getReferenceDCTypeName,
  findUniqueID,
} from './ModelFunctions';
import * as Logger from '../../lib/logger';

export type NewImportItems = {
  elements: Record<string, EditorNode>;
  pages: Record<string, EditorSubprocess>;
  provisions: Record<string, MMELProvision>;
  roles: Record<string, MMELRole>;
  figures: Record<string, MMELFigure>;
  tables: Record<string, MMELTable>;
  vars: Record<string, MMELVariable>;
  refs: Record<string, MMELReference>;
  notes: Record<string, MMELNote>;
  links: Record<string, MMELLink>;
};

export function addProcessIfNotFound(
  model: EditorModel,
  rmodel: EditorModel,
  id: string,
  nameMap: Record<string, string>,
  refMap: Record<string, string>,
  roleMap: Record<string, string>,
  newItems: NewImportItems,
  pageid: string
): EditorProcess {
  try {
    if (nameMap[id] !== undefined) {
      return model.elements[nameMap[id]] as EditorProcess;
    }
    const newid = trydefaultID(id, model.elements);
    nameMap[id] = newid;

    const process = rmodel.elements[id] as EditorProcess;
    const actor =
      process.actor !== ''
        ? addRoleIfNotFound(model, rmodel, process.actor, roleMap, newItems)
        : undefined;
    const outputs: EditorRegistry[] = [];
    process.output.forEach(x => {
      outputs.push(
        addRegistryIfNotFound(
          model,
          rmodel,
          x,
          nameMap,
          refMap,
          newItems,
          pageid
        )
      );
    });
    const inputs: EditorRegistry[] = [];
    process.input.forEach(x => {
      inputs.push(
        addRegistryIfNotFound(
          model,
          rmodel,
          x,
          nameMap,
          refMap,
          newItems,
          pageid
        )
      );
    });
    const pros: string[] = [];
    process.provision.forEach(p =>
      pros.push(
        addProvision(model, rmodel, rmodel.provisions[p], refMap, newItems)
      )
    );
    const ns: string[] = [];
    process.notes.forEach(n =>
      ns.push(addNote(model, rmodel, rmodel.notes[n], refMap, newItems))
    );
    const newPage =
      process.page !== ''
        ? addPageIfNotFound(
          model,
          rmodel,
          process.page,
          nameMap,
          refMap,
          roleMap,
          newItems
        )
        : undefined;
    for (const x of process.measure) {
      addMeasureIfNotFound(model, rmodel, x, newItems);
    }
    for (const x of process.tables) {
      addTableIfNotFound(model, rmodel, x, newItems);
    }
    for (const x of process.figures) {
      addFigIfNotFound(model, rmodel, x, newItems);
    }
    const links: string[] = [];
    process.links.forEach(l =>
      links.push(addLink(model, rmodel.links[l], newItems))
    );

    const newProcess: EditorProcess = {
      id            : newid,
      name          : process.name,
      modality      : process.modality,
      actor         : actor !== undefined ? actor.id : '',
      output        : new Set(outputs.map(o => o.id)),
      input         : new Set(inputs.map(o => o.id)),
      provision     : new Set(pros),
      links         : new Set(links),
      notes         : new Set(ns),
      page          : newPage !== undefined ? newPage.id : '',
      datatype      : DataType.PROCESS,
      measure       : [...process.measure],
      tables        : new Set(process.tables),
      figures       : new Set(process.figures),
      comments      : new Set(process.comments),
      pages         : new Set<string>([pageid]),
      objectVersion : 'Editor',
    };
    newItems.elements[newid] = newProcess;
    return newProcess;
  } catch (e: unknown) {
    if (typeof e === 'object') {
      const error = e as Error;
      Logger.log(error.message);
      Logger.log(error.stack);
    }
    throw e;
  }
}

export function addComponentIfNotFound(
  model: EditorModel,
  rmodel: EditorModel,
  id: string,
  nameMap: Record<string, string>,
  refMap: Record<string, string>,
  roleMap: Record<string, string>,
  newItems: NewImportItems,
  pageid: string
): EditorNode {
  const elm = rmodel.elements[id];
  if (isEditorProcess(elm)) {
    return addProcessIfNotFound(
      model,
      rmodel,
      elm.id,
      nameMap,
      refMap,
      roleMap,
      newItems,
      pageid
    );
  }
  if (isEditorDataClass(elm)) {
    return addDCIfNotFound(
      model,
      rmodel,
      id,
      nameMap,
      refMap,
      newItems,
      pageid
    );
  }
  if (isEditorRegistry(elm)) {
    return addRegistryIfNotFound(
      model,
      rmodel,
      id,
      nameMap,
      refMap,
      newItems,
      pageid
    );
  }
  const newid = trydefaultID(id, model.elements);
  nameMap[id] = newid;
  const newElm = { ...elm, id : newid, pages : new Set([pageid]) };
  newItems.elements[newid] = newElm;
  return newElm;
}

function addPageIfNotFound(
  model: EditorModel,
  rmodel: EditorModel,
  id: string,
  nameMap: Record<string, string>,
  refMap: Record<string, string>,
  roleMap: Record<string, string>,
  newItems: NewImportItems
): EditorSubprocess {
  const page = rmodel.pages[id];

  const newid = findUniqueID('Page', model.pages);
  const newPage: EditorSubprocess = {
    id            : newid,
    childs        : {},
    data          : {},
    edges         : {},
    datatype      : DataType.SUBPROCESS,
    start         : nameMap[page.start],
    neighbor      : {},
    objectVersion : 'Editor',
  };
  newItems.pages[newid] = newPage;

  const newChilds: Record<string, MMELSubprocessComponent> = {};
  Object.values(page.childs).forEach(c => {
    const newElm = addComponentIfNotFound(
      model,
      rmodel,
      c.element,
      nameMap,
      refMap,
      roleMap,
      newItems,
      newid
    );
    newChilds[c.element] = {
      ...c,
      element : newElm.id,
    };
  });
  newPage.childs = newChilds;

  const newData: Record<string, MMELSubprocessComponent> = {};
  Object.values(page.data).forEach(c => {
    const newElm = addComponentIfNotFound(
      model,
      rmodel,
      c.element,
      nameMap,
      refMap,
      roleMap,
      newItems,
      newid
    );
    newData[c.element] = {
      ...c,
      element : newElm.id,
    };
  });
  newPage.data = newData;

  const newEdges: Record<string, MMELEdge> = {};
  Object.values(page.edges).forEach(e => {
    addMeasureIfNotFound(model, rmodel, e.condition, newItems);
    newEdges[e.id] = {
      ...e,
      from : nameMap[e.from],
      to   : nameMap[e.to],
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

function addLink(
  model: EditorModel,
  link: MMELLink,
  newItems: NewImportItems
): string {
  const newid = findUniqueID('Link', model.links);
  const newLink: MMELLink = {
    ...link,
    id : newid,
  };
  newItems.links[newid] = newLink;
  return newid;
}

function addProvision(
  model: EditorModel,
  rmodel: EditorModel,
  provision: MMELProvision,
  refMap: Record<string, string>,
  newItems: NewImportItems
): string {
  const newid = findUniqueID('Provision', model.provisions);
  const refs: string[] = [];
  provision.ref.forEach(r =>
    refs.push(addRefIfNotFound(model, rmodel, r, refMap, newItems).id)
  );
  const newProvision: MMELProvision = {
    ...provision,
    id  : newid,
    ref : new Set(refs),
  };
  newItems.provisions[newid] = newProvision;
  return newid;
}

function addNote(
  model: EditorModel,
  rmodel: EditorModel,
  note: MMELNote,
  refMap: Record<string, string>,
  newItems: NewImportItems
): string {
  const newid = findUniqueID('Note', model.notes);
  const refs: string[] = [];
  note.ref.forEach(r =>
    refs.push(addRefIfNotFound(model, rmodel, r, refMap, newItems).id)
  );
  const newNote: MMELNote = {
    ...note,
    id  : newid,
    ref : new Set(refs),
  };
  newItems.notes[newid] = newNote;
  return newid;
}

function addRoleIfNotFound(
  model: EditorModel,
  rmodel: EditorModel,
  id: string,
  roleMap: Record<string, string>,
  newItems: NewImportItems
): MMELRole {
  if (roleMap[id] !== undefined) {
    const newId = roleMap[id];
    return model.roles[newId] ?? newItems.roles[newId];
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
    id       : newid,
    name     : role.name,
    datatype : DataType.ROLE,
  };
  newItems.roles[newid] = newRole;
  return newRole;
}

function addRegistryIfNotFound(
  model: EditorModel,
  rmodel: EditorModel,
  id: string,
  nameMap: Record<string, string>,
  refMap: Record<string, string>,
  newItems: NewImportItems,
  pageid: string
): EditorRegistry {
  if (nameMap[id] !== undefined) {
    const newId = nameMap[id];
    return (model.elements[newId] ??
      newItems.elements[newId]) as EditorRegistry;
  }

  const reg = rmodel.elements[id] as EditorRegistry;
  for (const x in model.elements) {
    const creg = model.elements[x];
    if (isEditorRegistry(creg) && reg.title === creg.title) {
      const refdc = rmodel.elements[reg.data] as EditorDataClass;
      const cdc = model.elements[creg.data] as EditorDataClass;
      if (isSameSetAttributes(refdc.attributes, cdc.attributes)) {
        nameMap[id] = creg.id;
        nameMap[refdc.id] = cdc.id;
        return creg;
      }
    }
  }

  const newid = trydefaultID(id, model.elements);
  nameMap[id] = newid;

  const dc = addDCIfNotFound(
    model,
    rmodel,
    reg.data,
    nameMap,
    refMap,
    newItems,
    pageid
  );
  const newReg: EditorRegistry = {
    id            : newid,
    title         : reg.title,
    data          : dc.id,
    datatype      : DataType.REGISTRY,
    objectVersion : 'Editor',
  };
  newItems.elements[newid] = newReg;
  return newReg;
}

function addDCIfNotFound(
  model: EditorModel,
  rmodel: EditorModel,
  id: string,
  nameMap: Record<string, string>,
  refMap: Record<string, string>,
  newItems: NewImportItems,
  pageid: string
): EditorDataClass {
  if (nameMap[id] !== undefined) {
    const newId = nameMap[id];
    return (model.elements[newId] ??
      newItems.elements[newId]) as EditorDataClass;
  }

  const dc = rmodel.elements[id] as EditorDataClass;
  const newid = trydefaultID(id, model.elements);
  nameMap[id] = newid;

  const attributes: Record<string, MMELDataAttribute> = {};
  Object.values(dc.attributes).forEach(refAtt => {
    const x: MMELDataAttribute = { ...refAtt };
    attributes[x.id] = x;
    const refs: string[] = [];
    x.ref.forEach(r =>
      refs.push(addRefIfNotFound(model, rmodel, r, refMap, newItems).id)
    );
    x.ref = new Set(refs);

    const trydc = rmodel.elements[x.type];
    if (trydc !== undefined && isEditorDataClass(trydc)) {
      x.type = addDCIfNotFound(
        model,
        rmodel,
        x.type,
        nameMap,
        refMap,
        newItems,
        pageid
      ).id;
    } else {
      const reg = getRegistryReference(x.type, rmodel.elements);
      if (reg !== null) {
        x.type = getReferenceDCTypeName(
          addRegistryIfNotFound(
            model,
            rmodel,
            reg.id,
            nameMap,
            refMap,
            newItems,
            pageid
          ).id
        );
      }
    }
  });
  const newrdcs: string[] = [];
  dc.rdcs.forEach(x => {
    const newName = nameMap[x];
    if (newName) {
      newrdcs.push(newName);
    } else {
      Logger.log('Error. Not on RDCS list', x);
    }
  });
  const newDC: EditorDataClass = {
    id            : newid,
    attributes,
    datatype      : DataType.DATACLASS,
    mother        : dc.mother === '' ? '' : nameMap[dc.mother],
    rdcs          : new Set(newrdcs),
    objectVersion : 'Editor',
  };
  newItems.elements[newid] = newDC;
  return newDC;
}

function addRefIfNotFound(
  model: EditorModel,
  rmodel: EditorModel,
  id: string,
  refMap: Record<string, string>,
  newItems: NewImportItems
): MMELReference {
  if (refMap[id] !== undefined) {
    const newId = refMap[id];
    return model.refs[newId] ?? newItems.refs[newId];
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
    id       : newid,
    document : r.document,
    clause   : r.clause,
    title    : r.title,
    datatype : DataType.REFERENCE,
  };
  newItems.refs[newid] = newRef;
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
  expression: string,
  newItems: NewImportItems
) {
  const results = Array.from(expression.matchAll(/\[.*?\]/g));
  for (const r of results) {
    const name = r[0].substring(1, r[0].length - 1);
    if (model.vars[name] === undefined && ref.vars[name] !== undefined) {
      newItems.vars[name] = { ...ref.vars[name] };
      addMeasureIfNotFound(model, ref, ref.vars[name].definition, newItems);
    }
  }
}

function addTableIfNotFound(
  model: EditorModel,
  ref: EditorModel,
  id: string,
  newItems: NewImportItems
) {
  const table = ref.tables[id];
  const newData = table.data.map(row => [...row]);
  if (table !== undefined && model.tables[id] === undefined) {
    newItems.tables[id] = { ...table, data : newData };
  }
}

function addFigIfNotFound(
  model: EditorModel,
  ref: EditorModel,
  id: string,
  newItems: NewImportItems
) {
  const fig = ref.figures[id];
  if (fig !== undefined && model.figures[id] === undefined) {
    newItems.figures[id] = { ...fig };
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
