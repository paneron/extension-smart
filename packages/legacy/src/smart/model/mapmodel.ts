/**
 * This is the data structure for mapping
 */

import React from 'react';
import { MAPVERSION } from '@/smart/utils/constants';
import { buildModelLinks } from '@/smart/utils/ModelFunctions';
import { JSONContext, JSONContextType } from '@/smart/utils/repo/io';
import {
  EditorModel,
  EditorNode,
  EditorSubprocess,
  isEditorApproval,
  isEditorProcess,
  ModelType,
} from './editormodel';
import {
  addToHistory,
  cloneHistory,
  createPageHistory,
  PageHistory,
} from './history';
import { ModelWrapper } from '@/smart/model/modelwrapper';

export interface MappingDoc {
  id: string;
  title: string;
  content: string;
}

// Mappingtype[fromid][toid] = MappingMeta
export type MappingType = Record<string, Record<string, MappingMeta>>;

export interface MapProfile {
  '@context': JSONContextType;
  '@type': 'MMEL_MAP';
  id: string; // namespace of the implementation model
  mapSet: Record<string, MapSet>;
  docs: Record<string, MappingDoc>; // report templates
  version: string;
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
    '@context' : JSONContext,
    '@type'    : 'MMEL_MAP',
    'id'       : '',
    'mapSet'   : {},
    'docs'     : {},
    'version'  : MAPVERSION,
  };
}

export function createNewMapSet(id: string) {
  return {
    id       : id,
    mappings : {},
  };
}

export type MapperModelType = ModelType.IMP | ModelType.REF;

export const MapperModelLabel: Record<MapperModelType, string> = {
  [ModelType.IMP] : 'Implementation Model',
  [ModelType.REF] : 'Reference Model',
};

export function getMappings(mp: MapProfile, refns: string): MappingType {
  return mp.mapSet[refns] === undefined ? {} : mp.mapSet[refns].mappings;
}

export function indexModel(model: EditorModel) {
  buildModelLinks(model);
  for (const e in model.elements) {
    const node = model.elements[e];
    if (isEditorApproval(node) || isEditorProcess(node)) {
      node.uiref = React.createRef();
    }
  }
}

export function buildHistoryMap(mw: ModelWrapper): Record<string, PageHistory> {
  const model = mw.model;
  const history = createPageHistory(mw);
  const page = model.pages[model.root];
  const hm = { [mw.page] : history };
  fillPageHistory(page, history, hm, model.elements, model.pages);
  return hm;
}

function fillPageHistory(
  page: EditorSubprocess,
  history: PageHistory,
  map: Record<string, PageHistory>,
  elements: Record<string, EditorNode>,
  pages: Record<string, EditorSubprocess>
) {
  for (const x in page.childs) {
    const id = page.childs[x].element;
    const node = elements[id];
    if (isEditorProcess(node) && node.page !== '') {
      const nextPage = pages[node.page];
      const nextHistory = cloneHistory(history);
      addToHistory(nextHistory, node.page, id);
      if (map[node.page] === undefined) {
        map[node.page] = nextHistory;
        fillPageHistory(nextPage, nextHistory, map, elements, pages);
      }
    }
  }
}
