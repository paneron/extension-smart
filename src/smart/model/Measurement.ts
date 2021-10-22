import {
  MMELVariable,
  MMELView,
  VarType,
} from '../serialize/interface/supportinterface';
import { EditorModel } from './editormodel';

export interface MTreeNode {
  action: string; // if data is a value, action = ''
  isData: boolean;
  childs: MTreeNode[];
  value: number[] | string;
}

export type EnviromentValues = Record<string, number[] | string>;
export type EnviromentVariables = Record<string, MTreeNode>;

export type InputableVarType = Exclude<
  VarType,
  typeof VarType.DERIVED | VarType.TABLE
>;

export type VarInputInterface = {
  model: EditorModel;
  variable: MMELVariable;
  value?: string;
  values: Record<string, string>;
  profile: MMELView | undefined;
  onChange: (v: string) => void;
};

export enum MeasureRType {
  OK = 'ok',
  NOTEST = 'notest',
  ERRORSOURCE = 'source',
  CONTAINERROR = 'contain',
}

export type MTestReport = MTestItem[];

export interface MTestItem {
  cond: string;
  left: number | string;
  right: number | string;
  result: boolean;
  description: string;
}

export interface MeasureResult {
  overall: boolean;
  items: Record<string, Record<string, MeasureRType>>; // items[pageid][componentid]
  reports: Record<string, MTestReport>; // reports[processid]
}
