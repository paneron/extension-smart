// the elements in the MMEL diagram
export interface MMELNode extends MMELObject {
  id: string;
}

// the base interface for all objects in MMEL
export interface MMELObject {
  datatype: DataType;
}

// all object types in MMEL
export enum DataType {
  DATAATTRIBUTE,
  DATACLASS,
  ENUMVALUE,
  ENUM,
  REGISTRY,
  ENDEVENT,
  SIGNALCATCHEVENT,
  STARTEVENT,
  TIMEREVENT,
  EDGE,
  SUBPROCESS,
  SUBPROCESSCOMPONENT,
  EGATE,
  VARIABLE,
  APPROVAL,
  PROCESS,
  ROLE,
  METADATA,
  PROVISION,
  REFERENCE,
}
