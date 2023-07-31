/**
 * The data model for checklist
 */

import { MMELProvision } from '@paneron/libmmel/interface/supportinterface';
import { MMELDataAttribute } from '@paneron/libmmel/interface/datainterface';
import { ModalityType } from '@/smart/utils/constants';
import {
  EditorApproval,
  EditorDataClass,
  EditorEGate,
  EditorProcess,
  EditorRegistry,
  isMMELDataAttribute,
} from '@/smart/model/editormodel';

export type ChecklistSetting = Record<ModalityType, boolean>;

export interface ChecklistItem {
  id: string;
  progress: number;
  tasks: string[];
}

export type EGatePath = string[];

export interface EGateCheckItem {
  id: string;
  progress: number;
  paths: EGatePath[];
}

export type ChecklistUpdateList = Record<string, string[]>;
export type ChecklistTaskList = Record<string, ChecklistItem>;
export type EGatePathTaskList = Record<string, EGateCheckItem>;

export type ChecklistNodeType =
  | EditorProcess
  | EditorApproval
  | EditorDataClass
  | EditorRegistry
  | MMELDataAttribute
  | MMELProvision
  | EditorEGate;

export interface ChecklistResult {
  checklist: ChecklistTaskList;
  egatelist: EGatePathTaskList;
  itemsDone: Record<string, number>;
  inverted: ChecklistUpdateList;
  reached: Set<string>;
}

export interface ChecklistCallback {
  onProgressChange: (id: string, progress: number) => void;
}

export interface ChecklistPackage {
  result: ChecklistResult;
  callback: ChecklistCallback;
}

export function getCheckListId(x: ChecklistNodeType, pid?: string) {
  if (isMMELDataAttribute(x)) {
    return `${x.datatype}#${pid ?? ''}#${x.id}`;
  } else if (pid !== undefined) {
    return `${x.datatype}#${pid}#${x.id}`;
  } else {
    return x.id;
  }
}

export function createCLItem(id: string, tasks?: string[]): ChecklistItem {
  return {
    id,
    progress : 0,
    tasks    : tasks ?? [],
  };
}

export function addInvertedItem(
  inverted: ChecklistUpdateList,
  id: string,
  mother: string
) {
  const record = inverted[id];
  if (record !== undefined) {
    record.push(mother);
  } else {
    inverted[id] = [mother];
  }
}
