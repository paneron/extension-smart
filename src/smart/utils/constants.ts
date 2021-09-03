import { OpenDialogProps } from '@riboseinc/paneron-extension-kit/types';
import { BufferDataset } from '@riboseinc/paneron-extension-kit/types/buffers';
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

export const TimerType = ['', 'WAIT', 'REPEAT'];

export const EMPTYTYPE = '';
export const STRINGTYPE = 'string';
export const BOOLEANTYPE = 'boolean';
export const DATETIMETYPE = 'datetime';
export const ROLETYPE = 'role';

const REPORTSTARTTAGTEXT = 'SMARTScript';
export const REPORTSTARTTAG = `<${REPORTSTARTTAGTEXT}>`;
export const REPORTENDTAG = `</${REPORTSTARTTAGTEXT}>`;

export const DATATYPE = [
  EMPTYTYPE,
  STRINGTYPE,
  BOOLEANTYPE,
  DATETIMETYPE,
  ROLETYPE,
] as const;

export type BASICTYPES = typeof DATATYPE[number];

export const BooleanOptions = ['', 'True', 'False'];

export enum EditAction {
  EDIT = 'edit',
  DELETE = 'delete',
}

export const MEASUREMENTTYPES = [
  VarType.DATA,
  VarType.LISTDATA,
  VarType.DERIVED,
];

export const searchableNodeDataTypes = [
  DataType.PROCESS,
  DataType.APPROVAL,
  DataType.TIMEREVENT,
  DataType.SIGNALCATCHEVENT,
  DataType.EGATE,
] as const;

export type SearchableNodeTypes = typeof searchableNodeDataTypes[number];

export type NewComponentTypes =
  | DataType.PROCESS
  | DataType.APPROVAL
  | DataType.ENDEVENT
  | DataType.TIMEREVENT
  | DataType.SIGNALCATCHEVENT
  | DataType.EGATE;

export type DescribableNodeTypes =
  | DataType.PROCESS
  | DataType.APPROVAL
  | DataType.TIMEREVENT
  | DataType.SIGNALCATCHEVENT
  | DataType.DATACLASS
  | DataType.REGISTRY
  | DataType.EGATE;

export type SelectableNodeTypes =
  | DescribableNodeTypes
  | DataType.ENDEVENT
  | DataType.STARTEVENT;

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

export interface LoggerInterface {
  log: (...args: unknown[]) => void;
}

export type OpenFileInterface = (
  opts: OpenDialogProps,
  cb?: (data: BufferDataset) => void
) => Promise<BufferDataset>;
