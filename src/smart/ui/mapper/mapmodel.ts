import React from 'react';
import {
  EditorModel,
  isEditorApproval,
  isEditorProcess,
  ModelType,
} from '../../model/editormodel';

// Mappingtype[fromid][toid] = MappingMeta
export type MappingType = Record<string, Record<string, MappingMeta>>;

export interface MapProfile {
  id: string; // namespace of the implementation model
  mapSet: Record<string, MapSet>;
}

export interface MapSet {
  id: string; // namespace of the reference model
  mappings: MappingType;
}

export interface MappingMeta {
  description: string; // Description of the mapping
  justification: string; // Justification of the mapping
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

export function getMappings(mp: MapProfile, refns: string): MappingType {
  return mp.mapSet[refns] === undefined ? {} : mp.mapSet[refns].mappings;
}

export function indexModel(model: EditorModel) {
  for (const p in model.pages) {
    const page = model.pages[p];
    const neighbor: Record<string, Set<string>> = {};
    Object.values(page.edges).forEach(e => {
      if (neighbor[e.from] === undefined) {
        neighbor[e.from] = new Set<string>();
      }
      neighbor[e.from].add(e.to);
    });
    page.neighbor = neighbor;
  }
  for (const e in model.elements) {
    const node = model.elements[e];
    if (isEditorApproval(node) || isEditorProcess(node)) {
      node.uiref = React.createRef();
    }
  }
}
