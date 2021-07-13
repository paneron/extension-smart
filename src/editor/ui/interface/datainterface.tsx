export interface IRole {
  roleid: string;
  rolename: string;
}

export interface IRef {
  refid: string;
  document: string;
  clause: string;
}

export interface IRegistry extends IAttributeContainer {
  regid: string;
  regtitle: string;
}

export interface IAttributeContainer {
  attributes: Array<IAttribute>;
}

export interface IAttribute {
  id: string;
  definition: string;
  type: string;
  modality: string;
  cardinality: string;
  ref: Array<string>;
}

export interface IDataclass extends IAttributeContainer {
  id: string;
}

export interface IEnum {
  id: string;
  values: Array<IEnumValue>;
}

export interface IEnumValue {
  id: string;
  value: string;
}

export interface IProcess {
  id: string;
  name: string;
  modality: string;
  actor: string;
  start: boolean;
  output: Array<string>;
  input: Array<string>;
  provision: Array<IProvision>;
  measure: Array<string>;
}

export interface IProvision {
  modality: string;
  condition: string;
  ref: Array<string>;
}

export interface IApproval {
  id: string;
  name: string;
  modality: string;
  actor: string;
  approver: string;
  records: Array<string>;
  ref: Array<string>;
}

export interface ITimer {
  id: string;
  type: string;
  para: string;
}

export interface ISignalCatchEvent {
  id: string;
  signal: string;
}

export interface IEGate {
  id: string;
  label: string;
  edges: Array<IEdgeLabel>;
}

export interface IEdgeLabel {
  id: string;
  description: string;
  condition: string;
  target: string;
}

export interface IVar {
  id: string;
  type: string;
  definition: string;
  description: string;
}
