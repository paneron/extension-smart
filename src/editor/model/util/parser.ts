import { Dataclass } from '../model/data/dataclass';
import { Enum } from '../model/data/enum';
import { Registry } from '../model/data/registry';
import { EndEvent } from '../model/event/endevent';
import { SignalCatchEvent } from '../model/event/signalcatchevent';
import { StartEvent } from '../model/event/startevent';
import { TimerEvent } from '../model/event/timerevent';
import { Subprocess } from '../model/flow/subprocess';
import { EGate } from '../model/gate/egate';
import { MapProfile } from '../model/mapping/profile';
import { Variable } from '../model/measure/variable';
import { Model } from '../model/model';
import { Approval } from '../model/process/approval';
import { Process } from '../model/process/process';
import { Metadata } from '../model/support/metadata';
import { Provision } from '../model/support/provision';
import { Reference } from '../model/support/reference';
import { Role } from '../model/support/role';
import * as tokenizer from './tokenizer';

export function parse(x: string): Model {
  const token: Array<string> = tokenizer.tokenize(x);
  let i = 0;
  const m: Model = new Model();
  while (i < token.length) {
    const command: string = token[i++];
    if (command == 'root') {
      m.roottext = token[i++].trim();
    } else if (command == 'metadata') {
      const meta: Metadata = new Metadata(token[i++]);
      m.meta = meta;
    } else if (command == 'role') {
      const r: Role = new Role(token[i++], token[i++]);
      m.roles.push(r);
      m.idreg.addID(r.id, r);
    } else if (command == 'provision') {
      const p: Provision = new Provision(token[i++], token[i++]);
      m.provisions.push(p);
      m.idreg.addProvision(p.id, p);
    } else if (command == 'process') {
      const p: Process = new Process(token[i++], token[i++]);
      m.hps.push(p);
      m.idreg.addID(p.id, p);
    } else if (command == 'class') {
      const p: Dataclass = new Dataclass(token[i++], token[i++]);
      m.dcs.push(p);
      m.idreg.addID(p.id, p);
    } else if (command == 'data_registry') {
      const p: Registry = new Registry(token[i++], token[i++]);
      m.regs.push(p);
      m.idreg.addID(p.id, p);
    } else if (command == 'start_event') {
      const p: StartEvent = new StartEvent(token[i++], token[i++]);
      m.evs.push(p);
      m.idreg.addID(p.id, p);
    } else if (command == 'end_event') {
      const p: EndEvent = new EndEvent(token[i++], token[i++]);
      m.evs.push(p);
      m.idreg.addID(p.id, p);
    } else if (command == 'timer_event') {
      const p: TimerEvent = new TimerEvent(token[i++], token[i++]);
      m.evs.push(p);
      m.idreg.addID(p.id, p);
    } else if (command == 'exclusive_gateway') {
      const p: EGate = new EGate(token[i++], token[i++]);
      m.gates.push(p);
      m.idreg.addID(p.id, p);
    } else if (command == 'subprocess') {
      const p: Subprocess = new Subprocess(token[i++], token[i++]);
      m.pages.push(p);
      m.idreg.addPage(p.id, p);
      p.edges.forEach(e => {
        m.idreg.addEdge(e.id, e);
      });
    } else if (command == 'reference') {
      const p: Reference = new Reference(token[i++], token[i++]);
      m.refs.push(p);
      m.idreg.addReference(p.id, p);
    } else if (command == 'map_profile') {
      const p: MapProfile = new MapProfile(token[i++], token[i++]);
      m.maps.addProfile(p);
    } else if (command == 'approval') {
      const p: Approval = new Approval(token[i++], token[i++]);
      m.aps.push(p);
      m.idreg.addID(p.id, p);
    } else if (command == 'enum') {
      const p: Enum = new Enum(token[i++], token[i++]);
      m.enums.push(p);
      m.idreg.addID(p.id, p);
    } else if (command == 'measurement') {
      const v: Variable = new Variable(token[i++], token[i++]);
      m.vars.push(v);
      m.idreg.addVariable(v.id, v);
    } else if (command == 'signal_catch_event') {
      const e: SignalCatchEvent = new SignalCatchEvent(token[i++], token[i++]);
      m.evs.push(e);
      m.idreg.addID(e.id, e);
    } else {
      console.error('Unknown command ' + command);
      break;
    }
  }
  m.resolve();
  return m;
}
