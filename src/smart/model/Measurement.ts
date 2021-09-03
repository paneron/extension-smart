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

export type MTestReport = MTestItem[];

export interface MTestItem {
  cond: string;
  left: number;
  right: number;
  result: boolean;
  description: string;
}

export interface MeasureResult {
  overall: boolean;
  items: Record<string, Record<string, MeasureRType>>; // items[pageid][componentid]
  reports: Record<string, MTestReport>; // reports[processid]
}
