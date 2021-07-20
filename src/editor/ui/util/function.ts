import { MMELNode } from '../../serialize/interface/baseinterface';
import { MMELRegistry } from '../../serialize/interface/datainterface';
import {
  MMELSignalCatchEvent,
  MMELTimerEvent,
} from '../../serialize/interface/eventinterface';
import {
  MMELEGate,
  MMELSubprocess,
} from '../../serialize/interface/flowcontrolinterface';
import {
  MMELApproval,
  MMELProcess,
} from '../../serialize/interface/processinterface';
import { StateMan } from '../interface/state';

export class functionCollection {
  static addPageToHistory = (x: MMELSubprocess, name: string): void => {
    alert('No implementation');
  };
  static getObjectByID = (id: string): MMELNode | undefined => {
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
  static viewDataRepository = (x: MMELRegistry): void => {
    alert('No implementation');
  };
  static viewEditProcess = (x: MMELProcess): void => {
    alert('No implementation');
  };
  static viewEditApproval = (x: MMELApproval): void => {
    alert('No implementation');
  };
  static getStateMan: () => StateMan;
  static viewEGate = (x: MMELEGate): void => {
    alert('No implementation');
  };
  static viewSignalCatch = (x: MMELSignalCatchEvent): void => {
    alert('No implementation');
  };
  static viewTimer = (x: MMELTimerEvent): void => {
    alert('No implementation');
  };
}
