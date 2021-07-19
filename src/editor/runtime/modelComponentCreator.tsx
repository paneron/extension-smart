import { XYPosition } from 'react-flow-renderer';
import { DataType, MMELNode } from '../serialize/interface/baseinterface';
import {
  MMELDataAttribute,
  MMELDataClass,
  MMELEnum,
  MMELEnumValue,
  MMELRegistry,
} from '../serialize/interface/datainterface';
import {
  MMELEndEvent,
  MMELSignalCatchEvent,
  MMELStartEvent,
  MMELTimerEvent,
} from '../serialize/interface/eventinterface';
import {
  MMELEdge,
  MMELEGate,
  MMELSubprocess,
  MMELSubprocessComponent,
} from '../serialize/interface/flowcontrolinterface';
import { MMELModel } from '../serialize/interface/model';
import {
  MMELApproval,
  MMELProcess,
} from '../serialize/interface/processinterface';
import {
  MMELMetadata,
  MMELProvision,
  MMELReference,
  MMELRole,
  MMELVariable,
} from '../serialize/interface/supportinterface';
import { isGraphNode, ModelWrapper } from '../ui/model/modelwrapper';
import { functionCollection } from '../ui/util/function';
import { DATATYPE, VarType } from './idManager';

export class MMELFactory {
  static createNewModel(): MMELModel {
    const page = MMELFactory.createSubprocess('Root');
    const start = MMELFactory.createStartEvent('Start0');
    const com = MMELFactory.createSubprocessComponent(start);
    page.childs.push(com);
    const m: MMELModel = {
      meta: MMELFactory.createMetaData(),
      roles: [],
      provisions: [],
      pages: [page],
      processes: [],
      dataclasses: [],
      regs: [],
      events: [start],
      gateways: [],
      refs: [],
      approvals: [],
      enums: [],
      vars: [],
      root: page,
    };
    return m;
  }

  static createEnum(id: string): MMELEnum {
    return {
      id: id,
      values: [],
      datatype: DataType.ENUM,
    };
  }

  static createEnumValue(id: string): MMELEnumValue {
    return {
      id: id,
      value: '',
      datatype: DataType.ENUMVALUE,
    };
  }

  static createMetaData(): MMELMetadata {
    return {
      schema: '',
      author: '',
      title: '',
      edition: '',
      namespace: '',
      datatype: DataType.METADATA,
    };
  }

  static createProvision(id: string): MMELProvision {
    return {
      subject: new Map<string, string>(),
      id: id,
      modality: '',
      condition: '',
      ref: [],
      datatype: DataType.PROVISION,
    };
  }

  static createReference(id: string): MMELReference {
    return {
      id: id,
      document: '',
      clause: '',
      datatype: DataType.REFERENCE,
    };
  }

  static createRole(id: string): MMELRole {
    return {
      id: id,
      name: '',
      datatype: DataType.ROLE,
    };
  }

  static createSubprocess(id: string): MMELSubprocess {
    return {
      id: id,
      childs: [],
      edges: [],
      data: [],
      datatype: DataType.SUBPROCESS,
    };
  }

  static createDataAttribute(id: string): MMELDataAttribute {
    return {
      id: id,
      type: '',
      modality: '',
      cardinality: '',
      definition: '',
      ref: [],
      satisfy: [],
      datatype: DataType.DATAATTRIBUTE,
    };
  }

  static createDataClass(id: string): MMELDataClass {
    return {
      id: id,
      attributes: [],
      datatype: DataType.DATACLASS,
    };
  }

  static createRegistry(id: string): MMELRegistry {
    return {
      id: id,
      title: '',
      data: null,
      datatype: DataType.REGISTRY,
    };
  }

  static createStartEvent(id: string): MMELStartEvent {
    return {
      id: id,
      datatype: DataType.STARTEVENT,
    };
  }

  static createSubprocessComponent(elm: MMELNode): MMELSubprocessComponent {
    return {
      element: elm,
      x: 0,
      y: 0,
      datatype: DataType.SUBPROCESSCOMPONENT,
    };
  }

  static createEdge(id: string): MMELEdge {
    return {
      id: id,
      from: null,
      to: null,
      description: '',
      condition: '',
      datatype: DataType.EDGE,
    };
  }

  static createProcess(id: string): MMELProcess {
    return {
      id: id,
      datatype: DataType.PROCESS,
      name: '',
      modality: '',
      actor: null,
      output: [],
      input: [],
      provision: [],
      page: null,
      measure: [],
    };
  }

  static createApproval(id: string): MMELApproval {
    return {
      id: id,
      datatype: DataType.APPROVAL,
      name: '',
      modality: '',
      actor: null,
      approver: null,
      records: [],
      ref: [],
    };
  }

  static createVariable(id: string): MMELVariable {
    return {
      id: id,
      type: VarType.DATA,
      definition: '',
      description: '',
      datatype: DataType.VARIABLE,
    };
  }

  static createEndEvent(id: string): MMELEndEvent {
    return {
      id: id,
      datatype: DataType.ENDEVENT,
    };
  }

  static createTimerEvent(id: string): MMELTimerEvent {
    return {
      id: id,
      datatype: DataType.TIMEREVENT,
      type: '',
      para: '',
    };
  }

  static createSignalCatchEvent(id: string): MMELSignalCatchEvent {
    return {
      id: id,
      datatype: DataType.SIGNALCATCHEVENT,
      signal: '',
    };
  }

  static createEGate(id: string): MMELEGate {
    return {
      id: id,
      datatype: DataType.EGATE,
      label: '',
    };
  }

  static addComponent(
    type: string,
    mw: ModelWrapper,
    page: MMELSubprocess,
    pos: XYPosition
  ): MMELNode | null {
    let ret: MMELNode | null = null;
    if (type == 'process') {
      ret = addProcess(mw);
    }
    if (type == 'approval') {
      ret = addApproval(mw);
    }
    if (type == 'end') {
      ret = addEnd(mw);
    }
    if (type == 'timer') {
      ret = addTimer(mw);
    }
    if (type == 'signalcatch') {
      ret = addSignalCatch(mw);
    }
    if (type == 'egate') {
      ret = addEGate(mw);
    }
    if (type == 'custom') {
      ret = findProcess(mw, page);
    }
    if (type == 'import') {
      ret = loadImport();
      mw.filterman.readDocu(mw.model.refs);
    }
    if (ret != null) {
      const nc = MMELFactory.createSubprocessComponent(ret);
      nc.element = ret;
      nc.x = pos.x;
      nc.y = pos.y;
      mw.subman.get(page).map.set(ret.id, nc);
      page.childs.push(nc);
    }

    return null;
  }
}

function addProcess(mw: ModelWrapper): MMELProcess {
  const model = mw.model;
  const p = MMELFactory.createProcess(mw.idman.findUniqueID('Process'));
  model.processes.push(p);
  mw.idman.nodes.set(p.id, p);
  return p;
}

function addApproval(mw: ModelWrapper): MMELApproval {
  const idreg = mw.idman;
  const model = mw.model;
  const p = MMELFactory.createApproval(idreg.findUniqueID('Approval'));
  model.approvals.push(p);
  idreg.nodes.set(p.id, p);
  return p;
}

function addEnd(mw: ModelWrapper): MMELEndEvent {
  const idreg = mw.idman;
  const model = mw.model;
  const e = MMELFactory.createEndEvent(idreg.findUniqueID('EndEvent'));
  model.events.push(e);
  idreg.nodes.set(e.id, e);
  return e;
}

function addTimer(mw: ModelWrapper): MMELTimerEvent {
  const idreg = mw.idman;
  const model = mw.model;
  const e = MMELFactory.createTimerEvent(idreg.findUniqueID('TimerEvent'));
  model.events.push(e);
  idreg.nodes.set(e.id, e);
  return e;
}

function addSignalCatch(mw: ModelWrapper): MMELSignalCatchEvent {
  const idreg = mw.idman;
  const model = mw.model;
  const e = MMELFactory.createSignalCatchEvent(
    idreg.findUniqueID('SignalCatchEvent')
  );
  model.events.push(e);
  idreg.nodes.set(e.id, e);
  return e;
}

function addEGate(mw: ModelWrapper): MMELEGate {
  const idreg = mw.idman;
  const model = mw.model;
  const e = MMELFactory.createEGate(idreg.findUniqueID('EGate'));
  model.gateways.push(e);
  idreg.nodes.set(e.id, e);
  return e;
}

function findProcess(
  mw: ModelWrapper,
  page: MMELSubprocess
): MMELProcess | null {
  const sm = functionCollection.getStateMan();
  //const model = mw.model
  const idreg = mw.idman;
  const p = idreg.nodes.get(sm.state.addingexisting);
  sm.state.addingexisting = '';
  if (p != null && p.datatype == DataType.PROCESS) {
    const process = p as MMELProcess;
    mw.nodeman.get(process).pages.add(page);
    return process;
  }
  return null;
}

function loadImport(): MMELProcess | null {
  const sm = functionCollection.getStateMan();
  const imodel = sm.state.imodel;
  const type = sm.state.importing;
  const ns = sm.state.namespace;
  const imw = new ModelWrapper(imodel);
  const prefix = ns + '#';
  if (type == '*') {
    const id = prefix + '*';
    return addRootProcessToModel(imw, id, prefix);
  } else {
    const op = imw.idman.nodes.get(type);
    const id = prefix + type;
    if (op != undefined && op.datatype == DataType.PROCESS) {
      const process = op as MMELProcess;
      return addProcessIfNotFound(imw, id, prefix, process);
    }
  }
  console.error('Error import object', type, imodel, ns);
  return null;
}

function addRootProcessToModel(
  imw: ModelWrapper,
  id: string,
  prefix: string
): MMELProcess {
  const sm = functionCollection.getStateMan();
  const imodel = sm.state.imodel;
  const model = sm.state.modelWrapper.model;
  const idreg = sm.state.modelWrapper.idman;

  const p = MMELFactory.createProcess(id);
  p.name = imodel.meta.title;
  if (imodel.root != null) {
    p.page = addPageIfNotFound(
      imw,
      prefix + imodel.root.id,
      prefix,
      imodel.root
    );
  }

  if (idreg.nodes.has(id)) {
    console.error('Error adding imported process', p);
  }
  idreg.nodes.set(id, p);
  model.processes.push(p);
  return p;
}

function addRoleIfNotFound(
  imw: ModelWrapper,
  id: string,
  role: MMELRole
): MMELRole {
  const sm = functionCollection.getStateMan();
  const model = sm.state.modelWrapper.model;
  const idreg = sm.state.modelWrapper.idman;
  if (!idreg.roles.has(id)) {
    const r = MMELFactory.createRole(id);
    r.name = role.name;
    model.roles.push(r);
    idreg.roles.set(id, r);
    return r;
  }
  const r = idreg.roles.get(id);
  if (r != undefined && r.datatype == DataType.ROLE) {
    return r as MMELRole;
  }
  console.error('Error find object', role);
  return role;
}

function addProcessIfNotFound(
  imw: ModelWrapper,
  id: string,
  prefix: string,
  process: MMELProcess
): MMELProcess {
  const sm = functionCollection.getStateMan();
  const model = sm.state.modelWrapper.model;
  const idreg = sm.state.modelWrapper.idman;
  if (!idreg.nodes.has(id)) {
    const p = MMELFactory.createProcess(id);
    p.name = process.name;
    if (process.actor != null) {
      p.actor = addRoleIfNotFound(
        imw,
        prefix + process.actor.id,
        process.actor
      );
    }
    p.modality = process.modality;
    process.input.map(d => {
      p.input.push(addRegistryIfNotFound(imw, prefix + d.id, prefix, d));
    });
    process.output.map(d => {
      p.output.push(addRegistryIfNotFound(imw, prefix + d.id, prefix, d));
    });
    process.provision.map(pro => {
      p.provision.push(
        addProvisionIfNotFound(imw, prefix + pro.id, prefix, pro)
      );
    });
    if (process.page != null) {
      p.page = addPageIfNotFound(
        imw,
        prefix + process.page.id,
        prefix,
        process.page
      );
    }
    model.processes.push(p);
    idreg.nodes.set(id, p);
    return p;
  }
  const p = idreg.nodes.get(id);
  if (p != undefined && p.datatype == DataType.PROCESS) {
    return p as MMELProcess;
  }
  console.error('Error find object', process);
  return process;
}

function addApprovalIfNotFound(
  imw: ModelWrapper,
  id: string,
  prefix: string,
  approval: MMELApproval
): MMELApproval {
  const sm = functionCollection.getStateMan();
  const model = sm.state.modelWrapper.model;
  const idreg = sm.state.modelWrapper.idman;
  if (!idreg.nodes.has(id)) {
    const p = MMELFactory.createApproval(id);
    p.name = approval.name;
    p.modality = approval.modality;
    if (approval.actor != null) {
      p.actor = addRoleIfNotFound(
        imw,
        prefix + approval.actor.id,
        approval.actor
      );
    }
    if (approval.approver != null) {
      p.approver = addRoleIfNotFound(
        imw,
        prefix + approval.approver.id,
        approval.approver
      );
    }
    approval.records.map(d => {
      p.records.push(addRegistryIfNotFound(imw, prefix + d.id, prefix, d));
    });
    approval.ref.map(r => {
      p.ref.push(addReferenceIfNotFound(imw, prefix + r.id, r));
    });
    model.approvals.push(p);
    idreg.nodes.set(id, p);
    return p;
  }
  const p = idreg.nodes.get(id);
  if (p != undefined && p.datatype == DataType.APPROVAL) {
    return p as MMELApproval;
  }
  console.error('Error find object', approval);
  return approval;
}

function addRegistryIfNotFound(
  imw: ModelWrapper,
  id: string,
  prefix: string,
  registry: MMELRegistry
): MMELRegistry {
  const sm = functionCollection.getStateMan();
  const model = sm.state.modelWrapper.model;
  const idreg = sm.state.modelWrapper.idman;
  if (!idreg.nodes.has(id)) {
    const r = MMELFactory.createRegistry(id);
    // Cloning Registry
    r.title = registry.title;
    if (registry.data != null) {
      r.data = addDataclassIfNotFound(
        imw,
        prefix + registry.data.id,
        prefix,
        registry.data
      );
      sm.state.modelWrapper.dlman.get(r.data!).mother = r;
    }
    model.regs.push(r);
    idreg.nodes.set(id, r);
    idreg.regs.set(id, r);
    return r;
  }
  const r = idreg.nodes.get(id);
  if (r != undefined && r.datatype == DataType.REGISTRY) {
    return r as MMELRegistry;
  }
  console.error('Error find object', registry);
  return registry;
}

function addDataclassIfNotFound(
  imw: ModelWrapper,
  id: string,
  prefix: string,
  dc: MMELDataClass
): MMELDataClass {
  const sm = functionCollection.getStateMan();
  const mw = sm.state.modelWrapper;
  const model = mw.model;
  const idreg = mw.idman;
  if (!idreg.nodes.has(id)) {
    const r = MMELFactory.createDataClass(id);
    // Cloning Dataclass
    dc.attributes.map(a => {
      const na = MMELFactory.createDataAttribute(prefix + a.id);
      na.cardinality = a.cardinality;
      na.definition = a.definition;
      na.modality = a.modality;
      a.ref.map(r => {
        na.ref.push(addReferenceIfNotFound(imw, prefix + r.id, r));
      });
      a.satisfy.map(s => {
        na.satisfy.push(prefix + s);
      });
      if (DATATYPE.indexOf(a.type) != -1) {
        na.type = a.type;
      } else {
        const u = a.type.indexOf('(');
        const v = a.type.indexOf(')');
        if (u != -1 && v != -1) {
          const type = a.type.substr(u + 1, v - u - 1);
          const nextdc = imw.idman.nodes.get(type);
          if (nextdc != undefined && nextdc.datatype == DataType.DATACLASS) {
            const ret = addDataclassIfNotFound(
              imw,
              prefix + type,
              prefix,
              nextdc as MMELDataClass
            );
            na.type = 'reference(' + ret.id + ')';
            const raddon = mw.dlman.get(r);
            if (!raddon.rdcs.has(ret)) {
              raddon.rdcs.add(ret);
            }
          }
        } else {
          const nextdc = imw.idman.nodes.get(a.type);
          if (nextdc != undefined && nextdc.datatype == DataType.DATACLASS) {
            const ret = addDataclassIfNotFound(
              imw,
              prefix + a.type,
              prefix,
              nextdc as MMELDataClass
            );
            na.type = ret.id;
            const raddon = mw.dlman.get(r);
            if (!raddon.rdcs.has(ret)) {
              raddon.rdcs.add(ret);
            }
          } else if (nextdc != undefined && nextdc.datatype == DataType.ENUM) {
            const en = nextdc as MMELEnum;
            const ret = addEnumIfNotFound(imw, prefix + en.id, en);
            na.type = ret.id;
          }
        }
      }
      mw.clman.getItemAddOn(na).mother.push(r);
      r.attributes.push(na);
    });
    model.dataclasses.push(r);
    idreg.nodes.set(id, r);
    idreg.dcs.set(id, r);
    return r;
  }
  const r = idreg.nodes.get(id);
  if (r != undefined && r.datatype == DataType.DATACLASS) {
    return r as MMELDataClass;
  }
  console.error('Error find object', dc);
  return dc;
}

function addEnumIfNotFound(
  imw: ModelWrapper,
  id: string,
  en: MMELEnum
): MMELEnum {
  const sm = functionCollection.getStateMan();
  const mw = sm.state.modelWrapper;
  const model = mw.model;
  const idreg = mw.idman;
  if (!idreg.enums.has(id)) {
    const r = MMELFactory.createEnum(id);
    // Cloning Enum
    en.values.forEach(v => {
      const ev = MMELFactory.createEnumValue(v.id);
      ev.value = v.value;
      r.values.push(ev);
    });

    model.enums.push(r);
    idreg.enums.set(id, r);
    return r;
  }
  const r = idreg.enums.get(id);
  if (r != undefined && r.datatype == DataType.ENUM) {
    return r as MMELEnum;
  }
  console.error('Error find object', en);
  return en;
}

function addProvisionIfNotFound(
  imw: ModelWrapper,
  id: string,
  prefix: string,
  provision: MMELProvision
): MMELProvision {
  const sm = functionCollection.getStateMan();
  const mw = sm.state.modelWrapper;
  const model = mw.model;
  const idreg = mw.idman;
  if (!idreg.provisions.has(id)) {
    const p = MMELFactory.createProvision(id);
    // Cloning Provision
    provision.subject.forEach((v, k) => {
      p.subject.set(k, v);
    });
    p.modality = provision.modality;
    p.condition = provision.condition;
    provision.ref.map(r => {
      p.ref.push(addReferenceIfNotFound(imw, prefix + r.id, r));
    });
    model.provisions.push(p);
    idreg.provisions.set(id, p);
    return p;
  }
  const r = idreg.provisions.get(id);
  if (r != undefined && r.datatype == DataType.PROVISION) {
    return r as MMELProvision;
  }
  console.error('Error find object', provision);
  return provision;
}

function addReferenceIfNotFound(
  imw: ModelWrapper,
  id: string,
  ref: MMELReference
): MMELReference {
  const sm = functionCollection.getStateMan();
  const mw = sm.state.modelWrapper;
  const model = mw.model;
  const idreg = mw.idman;
  if (!idreg.refs.has(id)) {
    const r = MMELFactory.createReference(id);
    // Cloning Reference
    r.document = ref.document;
    r.clause = ref.clause;
    model.refs.push(r);
    idreg.refs.set(id, r);
    return r;
  }
  const r = idreg.refs.get(id);
  if (r != undefined && r.datatype == DataType.REFERENCE) {
    return r as MMELReference;
  }
  console.error('Error find object', ref);
  return ref;
}

function addPageIfNotFound(
  imw: ModelWrapper,
  id: string,
  prefix: string,
  page: MMELSubprocess
): MMELSubprocess {
  const sm = functionCollection.getStateMan();
  const mw = sm.state.modelWrapper;
  const model = mw.model;
  const idreg = mw.idman;
  if (!idreg.pages.has(id)) {
    const p = MMELFactory.createSubprocess(id);
    // Cloning Subprocess
    page.childs.map(c => {
      if (c.element != null && isGraphNode(c.element)) {
        const id = prefix + c.element.id;
        const elm = addGraphNodeIfNotFound(imw, id, prefix, c.element);
        const nc = MMELFactory.createSubprocessComponent(elm);
        nc.x = c.x;
        nc.y = c.y;
        p.childs.push(nc);
        mw.subman.get(p).map.set(id, nc);
      }
    });
    page.edges.map(e => {
      const ne = MMELFactory.createEdge(prefix + e.id);
      ne.description = e.description;
      if (e.from != null && e.from.element != null) {
        const id = prefix + e.from.element.id;
        const ret = mw.subman.get(p).map.get(id);
        if (ret != null) {
          ne.from = ret;
        }
      }
      if (e.to != null && e.to.element != null) {
        const id = prefix + e.to.element.id;
        const ret = mw.subman.get(p).map.get(id);
        if (ret != null) {
          ne.to = ret;
        }
      }
      if (ne.from != null) {
        mw.comman.get(ne.from).child.push(ne);
      } else {
        console.error('Edge elements not found!', ne);
      }
      idreg.edges.set(ne.id, ne);
      p.edges.push(ne);
    });
    page.data.map(c => {
      if (c.element != null && c.element.datatype == DataType.REGISTRY) {
        const id = prefix + c.element.id;
        const elm = addRegistryIfNotFound(
          imw,
          id,
          prefix,
          c.element as MMELRegistry
        );
        const nc = MMELFactory.createSubprocessComponent(elm);
        nc.x = c.x;
        nc.y = c.y;
        p.data.push(nc);
        mw.subman.get(p).map.set(id, nc);
      } else if (
        c.element != null &&
        c.element.datatype == DataType.DATACLASS
      ) {
        const id = prefix + c.element.id;
        const elm = addDataclassIfNotFound(
          imw,
          id,
          prefix,
          c.element as MMELDataClass
        );
        const nc = MMELFactory.createSubprocessComponent(elm);
        nc.x = c.x;
        nc.y = c.y;
        p.data.push(nc);
        mw.subman.get(p).map.set(id, nc);
      }
    });
    const paddon = imw.subman.get(page);
    if (paddon.start != null && paddon.start.element != null) {
      const start = mw.subman.get(p).map.get(prefix + paddon.start.element.id);
      if (start != undefined) {
        mw.subman.get(p).start = start;
      }
    }
    model.pages.push(p);
    idreg.pages.set(id, p);
    return p;
  }
  const r = idreg.pages.get(id);
  if (r != undefined && r.datatype == DataType.SUBPROCESS) {
    return r as MMELSubprocess;
  }
  console.error('Error find object', page);
  return page;
}

function addEGateIfNotFound(
  imw: ModelWrapper,
  id: string,
  g: MMELEGate
): MMELEGate {
  const sm = functionCollection.getStateMan();
  const mw = sm.state.modelWrapper;
  const model = mw.model;
  const idreg = mw.idman;
  if (!idreg.nodes.has(id)) {
    const r = MMELFactory.createEGate(id);
    // Cloning EGate
    r.label = g.label;
    model.gateways.push(r);
    idreg.nodes.set(id, r);
    return r;
  }
  const r = idreg.nodes.get(id);
  if (r != undefined && r.datatype == DataType.EGATE) {
    return r as MMELEGate;
  }
  console.error('Error find object', g);
  return g;
}

function addStartEventIfNotFound(
  imw: ModelWrapper,
  id: string,
  e: MMELStartEvent
): MMELStartEvent {
  const sm = functionCollection.getStateMan();
  const mw = sm.state.modelWrapper;
  const model = mw.model;
  const idreg = mw.idman;
  if (!idreg.nodes.has(id)) {
    const r = MMELFactory.createStartEvent(id);
    // Cloning Start Event
    model.events.push(r);
    idreg.nodes.set(id, r);
    return r;
  }
  const r = idreg.nodes.get(id);
  if (r != undefined && r.datatype == DataType.STARTEVENT) {
    return r as MMELStartEvent;
  }
  console.error('Error find object', e);
  return e;
}

function addEndEventIfNotFound(
  imw: ModelWrapper,
  id: string,
  e: MMELEndEvent
): MMELEndEvent {
  const sm = functionCollection.getStateMan();
  const mw = sm.state.modelWrapper;
  const model = mw.model;
  const idreg = mw.idman;
  if (!idreg.nodes.has(id)) {
    const r = MMELFactory.createEndEvent(id);
    // Cloning End Event
    model.events.push(r);
    idreg.nodes.set(id, r);
    return r;
  }
  const r = idreg.nodes.get(id);
  if (r != undefined && r.datatype == DataType.ENDEVENT) {
    return r as MMELEndEvent;
  }
  console.error('Error find object', e);
  return e;
}

function addSCEventIfNotFound(
  imw: ModelWrapper,
  id: string,
  prefix: string,
  e: MMELSignalCatchEvent
): MMELSignalCatchEvent {
  const sm = functionCollection.getStateMan();
  const mw = sm.state.modelWrapper;
  const model = mw.model;
  const idreg = mw.idman;
  if (!idreg.nodes.has(id)) {
    const r = MMELFactory.createSignalCatchEvent(id);
    r.signal = prefix + e.signal;
    // Cloning Signal Catch Event
    model.events.push(r);
    idreg.nodes.set(id, r);
    return r;
  }
  const r = idreg.nodes.get(id);
  if (r != undefined && r.datatype == DataType.SIGNALCATCHEVENT) {
    return r as MMELSignalCatchEvent;
  }
  console.error('Error find object', e);
  return e;
}

function addTimerEventIfNotFound(
  imw: ModelWrapper,
  id: string,
  e: MMELTimerEvent
): MMELTimerEvent {
  const sm = functionCollection.getStateMan();
  const mw = sm.state.modelWrapper;
  const model = mw.model;
  const idreg = mw.idman;
  if (!idreg.nodes.has(id)) {
    const r = MMELFactory.createTimerEvent(id);
    // Cloning Timer Event
    r.type = e.type;
    r.para = e.para;
    model.events.push(r);
    idreg.nodes.set(id, r);
    return r;
  }
  const r = idreg.nodes.get(id);
  if (r != undefined && r.datatype == DataType.TIMEREVENT) {
    return r as MMELTimerEvent;
  }
  console.error('Error find object', e);
  return e;
}

function addGraphNodeIfNotFound(
  imw: ModelWrapper,
  id: string,
  prefix: string,
  x: MMELNode
): MMELNode {
  const sm = functionCollection.getStateMan();
  const mw = sm.state.modelWrapper;
  //const model = mw.model
  const idreg = mw.idman;
  const ret = idreg.nodes.get(id);
  if (ret != undefined && isGraphNode(ret)) {
    return ret as MMELNode;
  }
  if (x.datatype == DataType.PROCESS) {
    return addProcessIfNotFound(imw, id, prefix, x as MMELProcess);
  } else if (x.datatype == DataType.APPROVAL) {
    return addApprovalIfNotFound(imw, id, prefix, x as MMELApproval);
  } else if (x.datatype == DataType.EGATE) {
    return addEGateIfNotFound(imw, id, x as MMELEGate);
  } else if (x.datatype == DataType.STARTEVENT) {
    return addStartEventIfNotFound(imw, id, x as MMELStartEvent);
  } else if (x.datatype == DataType.ENDEVENT) {
    return addEndEventIfNotFound(imw, id, x as MMELEndEvent);
  } else if (x.datatype == DataType.TIMEREVENT) {
    return addTimerEventIfNotFound(imw, id, x as MMELTimerEvent);
  } else if (x.datatype == DataType.SIGNALCATCHEVENT) {
    return addSCEventIfNotFound(imw, id, prefix, x as MMELSignalCatchEvent);
  }
  console.error('Graph node type not found', x);
  return MMELFactory.createProcess('');
}
