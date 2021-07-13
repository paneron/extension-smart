import { XYPosition } from 'react-flow-renderer';
import { functionCollection } from '../../ui/util/function';
import { DataAttribute } from '../model/data/dataattribute';
import { Dataclass } from '../model/data/dataclass';
import { Enum, EnumValue } from '../model/data/enum';
import { Registry } from '../model/data/registry';
import { EndEvent } from '../model/event/endevent';
import { SignalCatchEvent } from '../model/event/signalcatchevent';
import { StartEvent } from '../model/event/startevent';
import { TimerEvent } from '../model/event/timerevent';
import { Edge } from '../model/flow/edge';
import { Subprocess, SubprocessComponent } from '../model/flow/subprocess';
import { EGate } from '../model/gate/egate';
import { GraphNode } from '../model/graphnode';
import { Model } from '../model/model';
import { Approval } from '../model/process/approval';
import { Process } from '../model/process/process';
import { Provision } from '../model/support/provision';
import { Reference } from '../model/support/reference';
import { Role } from '../model/support/role';
import { DATATYPE } from './IDRegistry';

function addProcess(model: Model): Process {
  const p = new Process(model.idreg.findUniqueID('Process'), '');
  model.hps.push(p);
  model.idreg.addID(p.id, p);
  return p;
}

function findProcess(model: Model, page: Subprocess): Process | null {
  const sm = functionCollection.getStateMan();
  const p = model.idreg.getObject(sm.state.addingexisting);
  sm.state.addingexisting = '';
  if (p != null && p instanceof Process) {
    p.pages.add(page);
    return p;
  }
  return null;
}

function addApproval(model: Model): Approval {
  const p = new Approval(model.idreg.findUniqueID('Approval'), '');
  model.aps.push(p);
  model.idreg.addID(p.id, p);
  return p;
}

function addEnd(model: Model): EndEvent {
  const e = new EndEvent(model.idreg.findUniqueID('EndEvent'), '');
  model.evs.push(e);
  model.idreg.addID(e.id, e);
  return e;
}

function addTimer(model: Model): TimerEvent {
  const e = new TimerEvent(model.idreg.findUniqueID('TimerEvent'), '');
  model.evs.push(e);
  model.idreg.addID(e.id, e);
  return e;
}

function addSignalCatch(model: Model): SignalCatchEvent {
  const e = new SignalCatchEvent(
    model.idreg.findUniqueID('SignalCatchEvent'),
    ''
  );
  model.evs.push(e);
  model.idreg.addID(e.id, e);
  return e;
}

function addEGate(model: Model): EGate {
  const e = new EGate(model.idreg.findUniqueID('EGate'), '');
  model.gates.push(e);
  model.idreg.addID(e.id, e);
  return e;
}

export function createNewModel(): Model {
  const m = new Model();
  return m;
}

export function addComponent(
  type: string,
  model: Model,
  page: Subprocess,
  pos: XYPosition
): GraphNode | null {
  let ret: GraphNode | null = null;
  if (type == 'process') {
    ret = addProcess(model);
  }
  if (type == 'approval') {
    ret = addApproval(model);
  }
  if (type == 'end') {
    ret = addEnd(model);
  }
  if (type == 'timer') {
    ret = addTimer(model);
  }
  if (type == 'signalcatch') {
    ret = addSignalCatch(model);
  }
  if (type == 'egate') {
    ret = addEGate(model);
  }
  if (type == 'custom') {
    ret = findProcess(model, page);
  }
  if (type == 'import') {
    ret = loadImport();
    functionCollection.getStateMan().state.modelWrapper.readDocu();
  }
  if (ret != null) {
    const nc = new SubprocessComponent(ret.id, '');
    nc.element = ret;
    nc.x = pos.x;
    nc.y = pos.y;
    page.map.set(ret.id, nc);
    page.childs.push(nc);
  }

  return null;
}

function loadImport(): Process | null {
  const sm = functionCollection.getStateMan();
  const imodel = sm.state.imodel;
  const type = sm.state.importing;
  const ns = sm.state.namespace;
  const prefix = ns + '#';
  if (type == '*') {
    const id = prefix + '*';
    return addRootProcessToModel(id, prefix);
  } else {
    const op = imodel.idreg.ids.get(type);
    const id = prefix + type;
    if (op != null && op instanceof Process) {
      return addProcessIfNotFound(id, prefix, op);
    }
  }
  console.error('Error import object', type, imodel, ns);
  return null;
}

function addRootProcessToModel(id: string, prefix: string): Process {
  const sm = functionCollection.getStateMan();
  const imodel = sm.state.imodel;
  const model = sm.state.modelWrapper.model;
  const idreg = model.idreg;

  const p = new Process(id, '');
  p.name = imodel.meta.title;
  if (imodel.root != null) {
    p.page = addPageIfNotFound(prefix + imodel.root.id, prefix, imodel.root);
  }

  if (idreg.ids.has(id)) {
    console.error('Error adding imported process', p);
  }
  idreg.addID(id, p);
  model.hps.push(p);
  return p;
}

function addRoleIfNotFound(id: string, role: Role): Role {
  const sm = functionCollection.getStateMan();
  const model = sm.state.modelWrapper.model;
  const idreg = model.idreg;
  if (!idreg.ids.has(id)) {
    const r = new Role(id, '');
    r.name = role.name;
    model.roles.push(r);
    idreg.addID(id, r);
    return r;
  }
  const r = idreg.ids.get(id);
  if (r != undefined && r instanceof Role) {
    return r;
  }
  console.error('Error find object', role);
  return role;
}

function addProcessIfNotFound(
  id: string,
  prefix: string,
  process: Process
): Process {
  const sm = functionCollection.getStateMan();
  const model = sm.state.modelWrapper.model;
  const idreg = model.idreg;
  if (!idreg.ids.has(id)) {
    const p = new Process(id, '');
    p.name = process.name;
    if (process.actor != null) {
      p.actor = addRoleIfNotFound(prefix + process.actor.id, process.actor);
    } else {
      p.actortext = '';
    }
    p.modality = process.modality;
    process.input.map(d => {
      p.input.push(addRegistryIfNotFound(prefix + d.id, prefix, d));
    });
    process.output.map(d => {
      p.output.push(addRegistryIfNotFound(prefix + d.id, prefix, d));
    });
    process.provision.map(pro => {
      p.provision.push(addProvisionIfNotFound(prefix + pro.id, prefix, pro));
    });
    if (process.page != null) {
      p.page = addPageIfNotFound(
        prefix + process.page.id,
        prefix,
        process.page
      );
    }
    model.hps.push(p);
    idreg.addID(id, p);
    return p;
  }
  const p = idreg.ids.get(id);
  if (p != undefined && p instanceof Process) {
    return p;
  }
  console.error('Error find object', process);
  return process;
}

function addApprovalIfNotFound(
  id: string,
  prefix: string,
  approval: Approval
): Approval {
  const sm = functionCollection.getStateMan();
  const model = sm.state.modelWrapper.model;
  const idreg = model.idreg;
  if (!idreg.ids.has(id)) {
    const p = new Approval(id, '');
    p.name = approval.name;
    p.modality = approval.modality;
    if (approval.actor != null) {
      p.actor = addRoleIfNotFound(prefix + approval.actor.id, approval.actor);
    }
    if (approval.approver != null) {
      p.approver = addRoleIfNotFound(
        prefix + approval.approver.id,
        approval.approver
      );
    }
    approval.records.map(d => {
      p.records.push(addRegistryIfNotFound(prefix + d.id, prefix, d));
    });
    approval.ref.map(r => {
      p.ref.push(addReferenceIfNotFound(prefix + r.id, r));
    });
    model.aps.push(p);
    idreg.addID(id, p);
    return p;
  }
  const p = idreg.ids.get(id);
  if (p != undefined && p instanceof Approval) {
    return p;
  }
  console.error('Error find object', approval);
  return approval;
}

function addRegistryIfNotFound(
  id: string,
  prefix: string,
  registry: Registry
): Registry {
  const sm = functionCollection.getStateMan();
  const model = sm.state.modelWrapper.model;
  const idreg = model.idreg;
  if (!idreg.ids.has(id)) {
    const r = new Registry(id, '');
    // Cloning Registry
    r.title = registry.title;
    if (registry.data != null) {
      r.data = addDataclassIfNotFound(
        prefix + registry.data.id,
        prefix,
        registry.data
      );
      r.data.mother = r;
    }
    model.regs.push(r);
    idreg.addID(id, r);
    return r;
  }
  const r = idreg.ids.get(id);
  if (r != undefined && r instanceof Registry) {
    return r;
  }
  console.error('Error find object', registry);
  return registry;
}

function addDataclassIfNotFound(
  id: string,
  prefix: string,
  dc: Dataclass
): Dataclass {
  const sm = functionCollection.getStateMan();
  const model = sm.state.modelWrapper.model;
  const idreg = model.idreg;
  if (!idreg.ids.has(id)) {
    const r = new Dataclass(id, '');
    // Cloning Dataclass
    dc.attributes.map(a => {
      const na = new DataAttribute(prefix + a.id, '');
      na.cardinality = a.cardinality;
      na.definition = a.definition;
      na.modality = a.modality;
      a.ref.map(r => {
        na.ref.push(addReferenceIfNotFound(prefix + r.id, r));
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
          const nextdc = sm.state.imodel.idreg.ids.get(type);
          if (nextdc != undefined && nextdc instanceof Dataclass) {
            const ret = addDataclassIfNotFound(prefix + type, prefix, nextdc);
            na.type = 'reference(' + ret.id + ')';
            if (!r.rdcs.has(ret)) {
              r.rdcs.add(ret);
            }
          }
        } else {
          const nextdc = sm.state.imodel.idreg.ids.get(a.type);
          if (nextdc != undefined && nextdc instanceof Dataclass) {
            const ret = addDataclassIfNotFound(prefix + a.type, prefix, nextdc);
            na.type = ret.id;
            if (!r.rdcs.has(ret)) {
              r.rdcs.add(ret);
            }
          } else if (nextdc != undefined && nextdc instanceof Enum) {
            const ret = addEnumIfNotFound(prefix + nextdc.id, nextdc);
            na.type = ret.id;
          }
        }
      }
      na.mother.push(r);
      r.attributes.push(na);
    });
    model.dcs.push(r);
    idreg.addID(id, r);
    return r;
  }
  const r = idreg.ids.get(id);
  if (r != undefined && r instanceof Dataclass) {
    return r;
  }
  console.error('Error find object', dc);
  return dc;
}

function addEnumIfNotFound(id: string, en: Enum): Enum {
  const sm = functionCollection.getStateMan();
  const model = sm.state.modelWrapper.model;
  const idreg = model.idreg;
  if (!idreg.reqs.has(id)) {
    const r = new Enum(id, '');
    // Cloning Enum
    en.values.forEach(v => {
      const ev = new EnumValue(v.id, '');
      ev.value = v.value;
      r.values.push(ev);
    });

    model.enums.push(r);
    idreg.addID(id, r);
    return r;
  }
  const r = idreg.ids.get(id);
  if (r != undefined && r instanceof Enum) {
    return r;
  }
  console.error('Error find object', en);
  return en;
}

function addProvisionIfNotFound(
  id: string,
  prefix: string,
  provision: Provision
): Provision {
  const sm = functionCollection.getStateMan();
  const model = sm.state.modelWrapper.model;
  const idreg = model.idreg;
  if (!idreg.reqs.has(id)) {
    const p = new Provision(id, '');
    // Cloning Provision
    provision.subject.forEach((v, k) => {
      p.subject.set(k, v);
    });
    p.modality = provision.modality;
    p.condition = provision.condition;
    provision.ref.map(r => {
      p.ref.push(addReferenceIfNotFound(prefix + r.id, r));
    });
    model.provisions.push(p);
    idreg.addProvision(id, p);
    return p;
  }
  const r = idreg.getProvision(id);
  if (r != undefined && r instanceof Provision) {
    return r;
  }
  console.error('Error find object', provision);
  return provision;
}

function addReferenceIfNotFound(id: string, ref: Reference): Reference {
  const sm = functionCollection.getStateMan();
  const model = sm.state.modelWrapper.model;
  const idreg = model.idreg;
  if (!idreg.refs.has(id)) {
    const r = new Reference(id, '');
    // Cloning Reference
    r.document = ref.document;
    r.clause = ref.clause;
    model.refs.push(r);
    idreg.addReference(id, r);
    return r;
  }
  const r = idreg.getReference(id);
  if (r != undefined && r instanceof Reference) {
    return r;
  }
  console.error('Error find object', ref);
  return ref;
}

function addPageIfNotFound(
  id: string,
  prefix: string,
  page: Subprocess
): Subprocess {
  const sm = functionCollection.getStateMan();
  const model = sm.state.modelWrapper.model;
  const idreg = model.idreg;
  if (!idreg.reqs.has(id)) {
    const p = new Subprocess(id, '');
    // Cloning Subprocess
    page.childs.map(c => {
      if (c.element != null && c.element instanceof GraphNode) {
        const id = prefix + c.element.id;
        const nc = new SubprocessComponent(id, '');
        nc.element = addGraphNodeIfNotFound(id, prefix, c.element);
        nc.x = c.x;
        nc.y = c.y;
        p.childs.push(nc);
        p.map.set(id, nc);
      }
    });
    page.edges.map(e => {
      const ne = new Edge(prefix + e.id, '');
      ne.description = e.description;
      if (e.from != null && e.from.element != null) {
        const id = prefix + e.from.element.id;
        const ret = p.map.get(id);
        if (ret != null && ret instanceof SubprocessComponent) {
          ne.from = ret;
        }
      }
      if (e.to != null && e.to.element != null) {
        const id = prefix + e.to.element.id;
        const ret = p.map.get(id);
        if (ret != null && ret instanceof SubprocessComponent) {
          ne.to = ret;
        }
      }
      if (ne.from != null) {
        ne.from.child.push(ne);
      } else {
        console.error('Edge elements not found!', ne);
      }
      idreg.addID(ne.id, ne);
      p.edges.push(ne);
    });
    page.data.map(c => {
      if (c.element != null && c.element instanceof Registry) {
        const id = prefix + c.element.id;
        const nc = new SubprocessComponent(id, '');
        nc.element = addRegistryIfNotFound(id, prefix, c.element);
        nc.x = c.x;
        nc.y = c.y;
        p.data.push(nc);
        p.map.set(id, nc);
      } else if (c.element != null && c.element instanceof Dataclass) {
        const id = prefix + c.element.id;
        const nc = new SubprocessComponent(id, '');
        nc.element = addDataclassIfNotFound(id, prefix, c.element);
        nc.x = c.x;
        nc.y = c.y;
        p.data.push(nc);
        p.map.set(id, nc);
      }
    });
    if (page.start != null && page.start.element != null) {
      const start = p.map.get(prefix + page.start.element.id);
      if (start != undefined) {
        p.start = start;
      }
    }
    model.pages.push(p);
    idreg.addID(id, p);
    return p;
  }
  const r = idreg.ids.get(id);
  if (r != undefined && r instanceof Subprocess) {
    return r;
  }
  console.error('Error find object', page);
  return page;
}

function addEGateIfNotFound(id: string, g: EGate): EGate {
  const sm = functionCollection.getStateMan();
  const model = sm.state.modelWrapper.model;
  const idreg = model.idreg;
  if (!idreg.ids.has(id)) {
    const r = new EGate(id, '');
    // Cloning EGate
    r.label = g.label;
    model.gates.push(r);
    idreg.addID(id, r);
    return r;
  }
  const r = idreg.ids.get(id);
  if (r != undefined && r instanceof EGate) {
    return r;
  }
  console.error('Error find object', g);
  return g;
}

function addStartEventIfNotFound(id: string, e: StartEvent): StartEvent {
  const sm = functionCollection.getStateMan();
  const model = sm.state.modelWrapper.model;
  const idreg = model.idreg;
  if (!idreg.ids.has(id)) {
    const r = new StartEvent(id, '');
    // Cloning Start Event
    model.evs.push(r);
    idreg.addID(id, r);
    return r;
  }
  const r = idreg.ids.get(id);
  if (r != undefined && r instanceof StartEvent) {
    return r;
  }
  console.error('Error find object', e);
  return e;
}

function addEndEventIfNotFound(id: string, e: EndEvent): EndEvent {
  const sm = functionCollection.getStateMan();
  const model = sm.state.modelWrapper.model;
  const idreg = model.idreg;
  if (!idreg.ids.has(id)) {
    const r = new EndEvent(id, '');
    // Cloning End Event
    model.evs.push(r);
    idreg.addID(id, r);
    return r;
  }
  const r = idreg.ids.get(id);
  if (r != undefined && r instanceof EndEvent) {
    return r;
  }
  console.error('Error find object', e);
  return e;
}

function addSCEventIfNotFound(
  id: string,
  prefix: string,
  e: SignalCatchEvent
): SignalCatchEvent {
  const sm = functionCollection.getStateMan();
  const model = sm.state.modelWrapper.model;
  const idreg = model.idreg;
  if (!idreg.ids.has(id)) {
    const r = new SignalCatchEvent(id, '');
    r.signal = prefix + e.signal;
    // Cloning Signal Catch Event
    model.evs.push(r);
    idreg.addID(id, r);
    return r;
  }
  const r = idreg.ids.get(id);
  if (r != undefined && r instanceof SignalCatchEvent) {
    return r;
  }
  console.error('Error find object', e);
  return e;
}

function addTimerEventIfNotFound(id: string, e: TimerEvent): TimerEvent {
  const sm = functionCollection.getStateMan();
  const model = sm.state.modelWrapper.model;
  const idreg = model.idreg;
  if (!idreg.ids.has(id)) {
    const r = new TimerEvent(id, '');
    // Cloning Timer Event
    r.type = e.type;
    r.para = e.para;
    model.evs.push(r);
    idreg.addID(id, r);
    return r;
  }
  const r = idreg.ids.get(id);
  if (r != undefined && r instanceof TimerEvent) {
    return r;
  }
  console.error('Error find object', e);
  return e;
}

function addGraphNodeIfNotFound(
  id: string,
  prefix: string,
  x: GraphNode
): GraphNode {
  const sm = functionCollection.getStateMan();
  const model = sm.state.modelWrapper.model;
  const idreg = model.idreg;
  const ret = idreg.ids.get(id);
  if (ret != undefined && ret instanceof GraphNode) {
    return ret;
  }
  if (x instanceof Process) {
    return addProcessIfNotFound(id, prefix, x);
  } else if (x instanceof Approval) {
    return addApprovalIfNotFound(id, prefix, x);
  } else if (x instanceof EGate) {
    return addEGateIfNotFound(id, x);
  } else if (x instanceof StartEvent) {
    return addStartEventIfNotFound(id, x);
  } else if (x instanceof EndEvent) {
    return addEndEventIfNotFound(id, x);
  } else if (x instanceof TimerEvent) {
    return addTimerEventIfNotFound(id, x);
  } else if (x instanceof SignalCatchEvent) {
    return addSCEventIfNotFound(id, prefix, x);
  }
  console.error('Graph node type not found', x);
  return new Process('', '');
}
