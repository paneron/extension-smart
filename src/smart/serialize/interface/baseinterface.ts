// all object types in MMEL
export enum DataType {
  DATAATTRIBUTE = 'attribute',
  DATACLASS = 'dc',
  ENUMVALUE = 'enumvalue',
  ENUM = 'enum',
  REGISTRY = 'reg',
  ENDEVENT = 'end',
  SIGNALCATCHEVENT = 'signal',
  STARTEVENT = 'start',
  TIMEREVENT = 'timer',
  EDGE = 'edge',
  SUBPROCESS = 'subprocess',
  SUBPROCESSCOMPONENT = 'subprocesscomponent',
  EGATE = 'egate',
  VARIABLE = 'var',
  APPROVAL = 'approval',
  PROCESS = 'process',
  ROLE = 'role',
  METADATA = 'metadata',
  PROVISION = 'provision',
  REFERENCE = 'ref',
  VIEW = 'view'
}

// the base interface for all objects in MMEL
export interface MMELObject {
  datatype: DataType;
}

// the elements in the MMEL diagram
export interface MMELNode extends MMELObject {
  id: string;
}
