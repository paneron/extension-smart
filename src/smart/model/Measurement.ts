export interface MTreeNode {
  action: string; // if data is in value, action = ''
  isData: boolean;
  childs: MTreeNode[];
  value: number[];
}

export type EnviromentValues = Record<string, number[]>;
export type EnviromentVariables = Record<string, MTreeNode>;

export enum MeasureRType {
  OK = 'ok',
  NOTEST = 'notest',
  ERRORSOURCE = 'source',
  CONTAINERROR = 'contain',
}

export interface MeasureResult {
  overall: boolean;
  items: Record<string, Record<string, MeasureRType>>; // items[pageid][componentid]
}
