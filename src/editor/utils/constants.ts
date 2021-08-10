import { DataType } from '../serialize/interface/baseinterface';
import { VarType } from '../serialize/interface/supportinterface';

export const MODAILITYOPTIONS: Array<string> = [
  '',
  'MUST',
  'SHALL',
  'SHOULD',
  'CAN',
  'MAY',
];

export const DragAndDropFormatType = 'application/MMEL';

export const EMPTYTYPE = '';
export const STRINGTYPE = 'string';
export const BOOLEANTYPE = 'boolean';
export const DATETIMETYPE = 'datetime';
export const ROLETYPE = 'role';

export const DATATYPE: Array<string> = [
  EMPTYTYPE,
  STRINGTYPE,
  BOOLEANTYPE,
  DATETIMETYPE,
  ROLETYPE,
];

export enum EditAction {
  EDIT = 'edit',
  DELETE = 'delete',
}

export const MEASUREMENTTYPES = [
  VarType.DATA,
  VarType.LISTDATA,
  VarType.DERIVED,
];

export type NewComponentTypes =
  | DataType.PROCESS
  | DataType.APPROVAL
  | DataType.ENDEVENT
  | DataType.TIMEREVENT
  | DataType.SIGNALCATCHEVENT
  | DataType.EGATE;

export type SelectableNodeTypes =
  | DataType.PROCESS
  | DataType.APPROVAL
  | DataType.ENDEVENT
  | DataType.TIMEREVENT
  | DataType.SIGNALCATCHEVENT
  | DataType.DATACLASS
  | DataType.REGISTRY
  | DataType.STARTEVENT
  | DataType.EGATE;

export type EditableNodeTypes =
  | DataType.PROCESS
  | DataType.APPROVAL
  | DataType.TIMEREVENT
  | DataType.SIGNALCATCHEVENT
  | DataType.EGATE;

export type DeletableNodeTypes =
  | DataType.PROCESS
  | DataType.APPROVAL
  | DataType.TIMEREVENT
  | DataType.SIGNALCATCHEVENT
  | DataType.EGATE
  | DataType.ENDEVENT;
