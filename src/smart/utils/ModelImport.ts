import { EditorDataClass, EditorNode, EditorProcess, EditorRegistry, EditorSubprocess, isEditorDataClass, isEditorProcess, isEditorRegistry } from "../model/editormodel";
import { ModelWrapper } from "../model/modelwrapper";
import { DataType } from "../serialize/interface/baseinterface";
import { MMELProvision, MMELReference, MMELRole } from "../serialize/interface/supportinterface";
import { trydefaultID, getRegistryReference, getReferenceDCTypeName, findUniqueID } from "./ModelFunctions";

export function addProcessIfNotFound(
  mw: ModelWrapper,
  ref: ModelWrapper,
  id: string,
  nameMap: Record<string, string>,
  refMap: Record<string, string>,
  roleMap: Record<string, string>
): EditorProcess {
  const rmodel = ref.model;  
  const model = mw.model;
  if (nameMap[id] !== undefined) {
    return model.elements[nameMap[id]] as EditorProcess;
  }
  const newid = trydefaultID(id, model.elements);
  nameMap[id] = newid;
  
  const process = rmodel.elements[id] as EditorProcess;
  const actor = process.actor !== '' ? addRoleIfNotFound(mw, ref, process.actor, roleMap) : undefined;
  const outputs: EditorRegistry[] = [];
  process.output.forEach(x => {
    outputs.push(addRegistryIfNotFound(mw, ref, x, nameMap, refMap));
  }); 
  const inputs: EditorRegistry[] = [];
  process.input.forEach(x => {
    inputs.push(addRegistryIfNotFound(mw, ref, x, nameMap, refMap));
  });
  const pros:string[] = [];
  process.provision.forEach(p => pros.push(addProvision(mw, ref, rmodel.provisions[p], refMap)));
  const newPage = process.page !== '' ? addPageIfNotFound(mw, ref, process.page, nameMap, refMap, roleMap):undefined;

  const newProcess:EditorProcess = {
    id: newid,
    name: process.name,
    modality: process.modality,
    actor: actor !== undefined ? actor.id : '',
    output: new Set(outputs.map(o => o.id)),
    input: new Set(inputs.map(o => o.id)),
    provision: new Set(pros),
    page: newPage !== undefined ? newPage.id : '',
    datatype: DataType.PROCESS,
    measure: [...process.measure], // not done yet
    added: false,
    pages: new Set<string>(), // not done yet, and other pages too
    objectVersion: 'Editor'
  }
  model.elements[newid] = newProcess;
  return newProcess;
}

function addComponentIfNotFound(
  mw: ModelWrapper,
  ref: ModelWrapper,
  id: string,
  nameMap: Record<string, string>,
  refMap: Record<string, string>,
  roleMap: Record<string, string>
): EditorNode {
  const rmodel = ref.model;  
  const model = mw.model;

  const elm = rmodel.elements[id];  
  if (isEditorProcess(elm)) {
    return addProcessIfNotFound(mw, ref, elm.id, nameMap, refMap, roleMap);
  }
  if (isEditorDataClass(elm)) {
    return addDCIfNotFound(mw, ref, id, nameMap, refMap);
  }
  if (isEditorRegistry(elm)) {
    return addRegistryIfNotFound(mw, ref, id, nameMap, refMap);
  }
  const newid = trydefaultID(id, model.elements);
  nameMap[id] = newid;
  const newElm = {...elm, id:newid};
  model.elements[newid] = newElm // not done yet
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

  const newChilds = {...page.childs}
  Object.values(newChilds).forEach(
    c => c.element = addComponentIfNotFound(mw, ref, c.element, nameMap, refMap, roleMap).id);
  const newData = {...page.data}
  Object.values(newData).forEach(
    c => c.element = addComponentIfNotFound(mw, ref, c.element, nameMap, refMap, roleMap).id);
  const newEdges = {...page.edges}
  Object.values(newEdges).forEach(
    e => {
      e.from = nameMap[e.from];
      e.to = nameMap[e.to];
    });

  const newid = findUniqueID('Page', mw.model.pages);
  const newNeighbor:Record<string, Set<string>> = {};
  Object.entries(page.neighbor).forEach(([from, tos]) => {
    const newSet:string[] = [];
    tos.forEach(x => {
      newSet.push(nameMap[x]);
    });
    newNeighbor[nameMap[from]] = new Set(newSet);
  });

  const newPage:EditorSubprocess = {
    id: newid,
    childs: newChilds,
    data: newData,
    edges: newEdges,
    datatype: DataType.SUBPROCESS,
    start: nameMap[page.start],
    neighbor: newNeighbor,
    objectVersion: 'Editor'
  }
  model.pages[newid] = newPage;
  return newPage;
}

function addProvision(
  mw: ModelWrapper,  
  ref: ModelWrapper,
  provision: MMELProvision,
  refMap: Record<string, string>
):string {
  const newid = findUniqueID('Provision', mw.model.provisions);
  const refs:string[] = [];
  provision.ref.forEach(r => refs.push(addRefIfNotFound(mw, ref, r, refMap).id));  
  const newProvision:MMELProvision = {
    ...provision,
    id: newid,
    ref: new Set(refs)
  }
  mw.model.provisions[newid] = newProvision;
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
  const newid = trydefaultID(id, model.roles);
  roleMap[id] = newid;

  const role = rmodel.roles[id];
  const newRole:MMELRole = {
    id: newid,
    name: role.name,
    datatype: DataType.ROLE
  }
  model.roles[newid] = newRole;
  return newRole;
}

function addRegistryIfNotFound(
  mw: ModelWrapper,
  ref: ModelWrapper,
  id: string,  
  nameMap: Record<string, string>,
  refMap: Record<string, string>,
): EditorRegistry {
  const rmodel = ref.model;  
  const model = mw.model;
  if (nameMap[id] !== undefined) {
    return model.elements[nameMap[id]] as EditorRegistry;
  }
  const newid = trydefaultID(id, model.elements);
  nameMap[id] = newid;

  const reg = rmodel.elements[id] as EditorRegistry;
  const dc = addDCIfNotFound(mw, ref, reg.data, nameMap, refMap);
  const newReg:EditorRegistry = {
    id: newid,
    title: reg.title,
    data: dc.id,
    datatype: DataType.REGISTRY,
    added: false,
    pages: new Set<string>(),
    objectVersion: 'Editor'
  }
  model.elements[newid] = newReg;
  return newReg;
}

function addDCIfNotFound (
  mw: ModelWrapper,
  ref: ModelWrapper,
  id: string,  
  nameMap: Record<string, string>,
  refMap: Record<string, string>,
): EditorDataClass {
  const rmodel = ref.model;  
  const model = mw.model;
  if (nameMap[id] !== undefined) {
    return model.elements[nameMap[id]] as EditorDataClass;
  }
  const newid = trydefaultID(id, model.elements);
  nameMap[id] = newid;  

  const dc = rmodel.elements[id] as EditorDataClass;
  const attributes = {...dc.attributes};
  Object.values(attributes).forEach(x => {
    const refs:string[] = [];
    x.ref.forEach(r => refs.push(addRefIfNotFound(mw, ref, r, refMap).id));
    x.ref = new Set(refs);

    const trydc = rmodel.elements[x.type];
    if (trydc !== undefined && isEditorDataClass(trydc)) {
      x.type = addDCIfNotFound(mw, ref, x.type, nameMap, refMap).id;
    } else {
      const reg = getRegistryReference(x.type, rmodel.elements);
      if (reg !== null) {
        x.type = getReferenceDCTypeName(addRegistryIfNotFound(mw, ref, x.type, nameMap, refMap).id);
      }
    }    
  });
  const newrdcs:string[] = [];
  dc.rdcs.forEach(x => {
    newrdcs.push(nameMap[x]);
  })
  const newDC:EditorDataClass = {    
    id: newid,
    attributes: {...dc.attributes},
    datatype: DataType.DATACLASS,
    mother: nameMap[dc.mother],
    rdcs: new Set(newrdcs),
    added: false,
    pages: new Set<string>(),
    objectVersion: 'Editor'
  }
  model.elements[newid] = newDC;
  return newDC;
}

function addRefIfNotFound (
  mw: ModelWrapper,
  ref: ModelWrapper,
  id: string,    
  refMap: Record<string, string>,
): MMELReference {
  const rmodel = ref.model;  
  const model = mw.model;
  if (refMap[id] !== undefined) {
    return model.refs[refMap[id]];
  }
  const newid = trydefaultID(id, model.refs);
  refMap[id] = newid;

  const r = rmodel.refs[id];  
  const newRef:MMELReference = {
    id: newid,    
    document: r.document,
    clause: r.clause,
    title: r.title,
    datatype: DataType.REFERENCE,    
  }
  model.refs[newid] = newRef;
  return newRef;
}