import { Registry } from '../../model/model/data/registry';
import { SignalCatchEvent } from '../../model/model/event/signalcatchevent';
import { TimerEvent } from '../../model/model/event/timerevent';
import { Subprocess } from '../../model/model/flow/subprocess';
import { EGate } from '../../model/model/gate/egate';
import { GraphNode } from '../../model/model/graphnode';
import { Approval } from '../../model/model/process/approval';
import { Process } from '../../model/model/process/process';
import { StateMan } from '../interface/state';

function alert(msg: string) {
  throw new Error(msg);
}

export class functionCollection {
  static addPageToHistory = (x: Subprocess, name: string): void => {
    alert('No implementation');
  };
  static getObjectByID = (id: string): GraphNode | undefined => {
    alert('No implementation');
    return undefined;
  };
  static saveLayout = (): void => {
    alert('No implementation');
  };
  static checkUpdated = (): void => {
    alert('No implementation');
  };
  static removeLayoutItem = (x: string): void => {
    alert('No implementation');
  };
  static renameLayoutItem = (old: string, name: string): void => {
    alert('No implementation');
  };
  static viewDataRepository = (x: Registry): void => {
    alert('No implementation');
  };
  static viewEditProcess = (x: Process): void => {
    alert('No implementation');
  };
  static viewEditApproval = (x: Approval): void => {
    alert('No implementation');
  };
  static getStateMan: () => StateMan;
  static viewEGate = (x: EGate): void => {
    alert('No implementation');
  };
  static viewSignalCatch = (x: SignalCatchEvent): void => {
    alert('No implementation');
  };
  static viewTimer = (x: TimerEvent): void => {
    alert('No implementation');
  };
}
