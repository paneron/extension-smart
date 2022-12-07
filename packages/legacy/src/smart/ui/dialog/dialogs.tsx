export enum MapperDiagTypes {
  EDITMAPPING = 'map',
  DOCUMENT = 'document',
}

export interface MapperDiagPackage {
  type: MapperDiagTypes | null;
  payload: EditMPropsInterface;
}

export interface EditMPropsInterface {
  from: string;
  to: string;
}
