import type { OpenFileDialogProps } from '@riboseinc/paneron-extension-kit/types/dialogs';
import type { ObjectDataset } from '@riboseinc/paneron-extension-kit/types/objects';
import { DataType } from '@paneron/libmmel/interface/baseinterface';
import { VarType } from '@paneron/libmmel/interface/supportinterface';

export const WSVERSION = 'v1.0.0-dev1';
export const MAPVERSION = 'v1.0.0-dev1';
export const DOCVERSION = 'v1.0.0-dev1';
export const MODELVERSION = 'v1.0.0-dev3';

export const MODALITY = ['MUST', 'SHALL', 'SHOULD', 'CAN', 'MAY'] as const;

export const MODAILITYOPTIONS = ['', ...MODALITY] as const;

export type ModalityType = typeof MODAILITYOPTIONS[number];

export const DragAndDropNewFormatType = 'text/MMELNew';
export const DragAndDropImportRefType = 'text/MMELImport';
export const DragAndDropMappingType = 'text/MMELMap';

export const TimerType = ['', 'WAIT', 'REPEAT'];

export const EMPTYTYPE = '';
export const STRINGTYPE = 'string';
export const BOOLEANTYPE = 'boolean';
export const DATETIMETYPE = 'datetime';
export const ROLETYPE = 'role';

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

export const MEASUREMENTTYPES = Object.values(VarType);

export const searchableNodeDataTypes = [
  DataType.PROCESS,
  DataType.APPROVAL,
  DataType.TIMEREVENT,
  DataType.SIGNALCATCHEVENT,
  DataType.EGATE,
] as const;

export type SearchableNodeTypes = typeof searchableNodeDataTypes[number];

export const NewComponents = [
  DataType.PROCESS,
  DataType.APPROVAL,
  DataType.ENDEVENT,
  DataType.TIMEREVENT,
  DataType.SIGNALCATCHEVENT,
  DataType.EGATE,
] as const;

export const DescribableNodes = [
  DataType.PROCESS,
  DataType.APPROVAL,
  DataType.TIMEREVENT,
  DataType.SIGNALCATCHEVENT,
  DataType.DATACLASS,
  DataType.REGISTRY,
  DataType.EGATE,
] as const;

export const SelectableNodes = [
  ...DescribableNodes,
  DataType.ENDEVENT,
  DataType.STARTEVENT,
] as const;

export const EditableNodes = [
  DataType.PROCESS,
  DataType.APPROVAL,
  DataType.TIMEREVENT,
  DataType.SIGNALCATCHEVENT,
  DataType.EGATE,
] as const;

export const DeletableNodes = [
  DataType.PROCESS,
  DataType.APPROVAL,
  DataType.TIMEREVENT,
  DataType.SIGNALCATCHEVENT,
  DataType.EGATE,
  DataType.ENDEVENT,
] as const;

export const MainFlowNodes = [
  DataType.PROCESS,
  DataType.APPROVAL,
  DataType.TIMEREVENT,
  DataType.SIGNALCATCHEVENT,
  DataType.EGATE,
  DataType.ENDEVENT,
  DataType.STARTEVENT,
] as const;

export const QuickEditableNodes = [
  DataType.PROCESS,
  DataType.APPROVAL,
  DataType.TIMEREVENT,
  DataType.SIGNALCATCHEVENT,
  DataType.EGATE,
  DataType.ENDEVENT,
  DataType.REGISTRY,
  DataType.DATACLASS,
] as const;

export type NewComponentTypes = typeof NewComponents[number];
export type DescribableNodeTypes = typeof DescribableNodes[number];
export type SelectableNodeTypes = typeof SelectableNodes[number];
export type EditableNodeTypes = typeof EditableNodes[number];
export type DeletableNodeTypes = typeof DeletableNodes[number];
export type QuickEditableNodeTypes = typeof QuickEditableNodes[number];
export type MainFlowNodeTypes = typeof MainFlowNodes[number];

export interface LoggerInterface {
  log: (...args: unknown[]) => void;
}

export type OpenFileInterface = (
  opts: OpenFileDialogProps,
  cb?: ((data: ObjectDataset) => void) | undefined
) => Promise<ObjectDataset>;
