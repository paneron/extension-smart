import { OnLoadParams } from 'react-flow-renderer';
import { PageHistory } from '../../model/history';
import { ModelWrapper } from '../../model/modelwrapper';
import { MappingProfile } from './MappingProfile';

export interface IMapModelState {
  cpvisible: boolean; // visibility of the control panel
  datavisible: boolean; // visibility of data nodes
  infovisible: boolean; // visibility of information pane
  history: PageHistory;
  modelWrapper: ModelWrapper;
  instance: OnLoadParams | null;
  type: ModelType;
  maps: Map<string, MappingProfile>;
}

export interface ModelViewStateMan {
  state: IMapModelState;
  setState: (s: IMapModelState) => void;
}

export enum ModelType {
  ReferenceModel,
  ImplementationModel,
}

export interface MapLinkState {
  source: Map<string, MappingProfile>;
  dest: Map<string, MappingProfile>;
  isMap: boolean;
  dummy: boolean; // for force update
}
