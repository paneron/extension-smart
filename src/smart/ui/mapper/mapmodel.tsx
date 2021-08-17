import { ModelType } from '../../model/editormodel';

export interface MapProfile {
  id: string; // namespace of the implementation model
  mapSet: Record<string, MapSet>;
}

export interface MapSet {
  id: string; // namespace of the reference model
  mappings: Record<string, Record<string, MappingMeta>>;
}

export interface MappingMeta {
  description: string; // Description of the mapping, e.g., justifications
}

export function createMapProfile(): MapProfile {
  return {
    id: '',
    mapSet: {},
  };
}

export function createNewMapSet(id: string) {
  return {
    id: id,
    mappings: {},
  };
}

export type MapperModelType = ModelType.IMP | ModelType.REF;

export const MapperModelLabel: Record<MapperModelType, string> = {
  [ModelType.IMP]: 'Implementation Model',
  [ModelType.REF]: 'Reference Model',
};
