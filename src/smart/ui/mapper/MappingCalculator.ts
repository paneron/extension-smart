import { CSSProperties, RefObject } from 'react';
import {
  EditorModel,
  EditorNode,
  EditorSubprocess,
  isEditorApproval,
  isEditorEgate,
  isEditorProcess,
  ModelType,
} from '../../model/editormodel';
import { PageHistory } from '../../model/history';
import { ModelWrapper } from '../../model/modelwrapper';
import { MapperSelectedInterface } from '../../model/state';
import { MappingType, MapProfile, MapSet } from './mapmodel';

export enum MapCoverType {
  FULL = 'full',
  PASS = 'pass',
  PARTIAL = 'partial',
  NONE = 'none',
}

export enum MapSourceType {
  HASMAP = 'yes',
  NOMAP = 'no',
}

export interface MapStyleInterface {
  label: string;
  color: string;
}

export interface MapEdgeResult {
  fromref: RefObject<HTMLDivElement>;
  toref: RefObject<HTMLDivElement>;
  fromPos?: DOMRect;
  toPos?: DOMRect;
  fromid: string;
  toid: string;
}

export type MapperModels = ModelType.IMP | ModelType.REF;

export const MapViewButtonToolTip: Record<MapperModels, string> = {
  [ModelType.IMP]: 'View outgoing mappings',
  [ModelType.REF]: 'View incoming mappings',
};

export const MappingResultStyles: Record<MapCoverType, MapStyleInterface> = {
  [MapCoverType.FULL]: { label: 'Fully covered', color: 'lightgreen' },
  [MapCoverType.PASS]: { label: 'Minimal covered', color: 'lightblue' },
  [MapCoverType.PARTIAL]: { label: 'Partially covered', color: 'lightyellow' },
  [MapCoverType.NONE]: { label: 'Not covered', color: '#E9967A' },
};

export const MappingSourceStyles: Record<MapSourceType, MapStyleInterface> = {
  [MapSourceType.HASMAP]: { label: 'Has mapping', color: 'lightblue' },
  [MapSourceType.NOMAP]: { label: 'No mapping', color: 'none' },
};

// MapResultType[nodeid] = MapCoverType
export type MapResultType = Record<string, MapCoverType>;

export function calculateMapping(
  model: EditorModel,
  mapping: MappingType
): MapResultType {
  const mr: MapResultType = {};
  Object.values(mapping).forEach(m =>
    Object.keys(m).forEach(k => (mr[k] = MapCoverType.FULL))
  );
  explorePage(model.pages[model.root], mr, model);
  return mr;
}

function check(
  id: string,
  mr: MapResultType,
  model: EditorModel
): MapCoverType {
  const node = model.elements[id];
  if (isEditorProcess(node)) {
    if (node.page !== '') {
      mr[id] = MapCoverType.FULL; // set an initial value to avoid infinite loop, if the subprocess contains itself, it counts ok now
      return explorePage(model.pages[node.page], mr, model);
    } else {
      return MapCoverType.NONE;
    }
  } else if (isEditorApproval(node)) {
    return MapCoverType.NONE;
  } else {
    return MapCoverType.FULL;
  }
}

function traverse(
  id: string,
  page: EditorSubprocess,
  mr: MapResultType,
  model: EditorModel,
  visited: Record<string, boolean>
): boolean {
  const node = model.elements[id];
  const result = mr[id];
  if (result !== MapCoverType.FULL && result !== MapCoverType.PASS) {
    visited[id] = false;
    return false;
  }
  if (isEditorEgate(node)) {
    let result = false;
    for (const elm of page.neighbor![id]) {
      if (visited[elm] === undefined) {
        visited[elm] = traverse(elm, page, mr, model, visited);
      }
      result ||= visited[elm];
    }
    return result;
  } else {
    let result = true;
    if (page.neighbor[id] === undefined) {
      return result;
    } else {
      for (const elm of page.neighbor![id]) {
        if (visited[elm] === undefined) {
          visited[elm] = traverse(elm, page, mr, model, visited);
        }
        result &&= visited[elm];
      }
      return result;
    }
  }
}

function explorePage(
  page: EditorSubprocess,
  mr: MapResultType,
  model: EditorModel
): MapCoverType {
  let somethingCovered = false;
  let somethingNotCovered = false;

  // first, check every node individually
  for (const c in page.childs) {
    const id = page.childs[c].element;
    const node = model.elements[id];
    if (mr[id] === undefined) {
      mr[id] = check(id, mr, model);
    }
    if (isEditorProcess(node) || isEditorApproval(node)) {
      if (mr[id] !== MapCoverType.NONE) {
        somethingCovered = true;
      }
      if (mr[id] !== MapCoverType.FULL) {
        somethingNotCovered = true;
      }
    }
  }

  if (!somethingNotCovered) {
    return MapCoverType.FULL;
  }

  // traverse the path from start to see if all necessary items are covered
  if (traverse(page.start, page, mr, model, {})) {
    return MapCoverType.PASS;
  }
  return somethingCovered ? MapCoverType.PARTIAL : MapCoverType.NONE;
}

export function getMapStyleById(
  mapResult: MapResultType,
  id: string
): CSSProperties {
  const result = mapResult[id];
  if (result === undefined) {
    return {
      backgroundColor: MappingResultStyles[MapCoverType.NONE].color,
    };
  }
  return {
    backgroundColor: MappingResultStyles[result].color,
  };
}

export function getSourceStyleById(mapSet: MapSet, id: string): CSSProperties {
  if (
    mapSet.mappings[id] === undefined ||
    Object.keys(mapSet.mappings[id]).length === 0
  ) {
    return {};
  }
  return {
    backgroundColor: MappingSourceStyles[MapSourceType.HASMAP].color,
  };
}

export function filterMappings(
  map: MapSet,
  impPage: EditorSubprocess,
  refPage: EditorSubprocess,
  selected: MapperSelectedInterface,
  impElms: Record<string, EditorNode>,
  refElms: Record<string, EditorNode>
): MapEdgeResult[] {
  const id = selected.selected;
  const result: MapEdgeResult[] = [];
  if (
    selected.modelType === ModelType.IMP &&
    impPage.childs[id] !== undefined
  ) {
    const maps = map.mappings[id];
    if (maps !== undefined) {
      Object.keys(maps).forEach(x => {
        if (refPage.childs[x] !== undefined) {
          result.push(getFilterMapRecord(impElms, refElms, id, x));
        }
      });
    }
  } else if (
    selected.modelType === ModelType.REF &&
    refPage.childs[id] !== undefined
  ) {
    for (const [key, maps] of Object.entries(map.mappings)) {
      if (maps[id] !== undefined) {
        result.push(getFilterMapRecord(impElms, refElms, key, id));
      }
    }
  }
  return result;
}

function getFilterMapRecord(
  impElms: Record<string, EditorNode>,
  refElms: Record<string, EditorNode>,
  impId: string,
  refId: string
): MapEdgeResult {
  const impNode = impElms[impId];
  const refNode = refElms[refId];
  return {
    fromref: impNode.uiref!,
    toref: refNode.uiref!,
    fromPos: impNode.uiref!.current?.getBoundingClientRect(),
    toPos: refNode.uiref!.current?.getBoundingClientRect(),
    fromid: impNode.id,
    toid: refNode.id,
  };
}

export function updateMapEdges(
  refMW: ModelWrapper,
  impMW: ModelWrapper,
  mp: MapProfile,
  selected: MapperSelectedInterface,
  setMapEdges: (me: MapEdgeResult[]) => void
) {
  if (selected.selected !== '') {
    const mapSet = mp.mapSet[refMW.model.meta.namespace];
    if (mapSet !== undefined) {
      const impPage = impMW.model.pages[impMW.page];
      const refPage = refMW.model.pages[refMW.page];

      const filtered = filterMappings(
        mapSet,
        impPage,
        refPage,
        selected,
        impMW.model.elements,
        refMW.model.elements
      );
      setMapEdges(filtered);
    }
  } else {
    setMapEdges([]);
  }
}

export function updatePosMapEdges(edges: MapEdgeResult[]): MapEdgeResult[] {
  return edges.map(e => ({
    ...e,
    fromPos: e.fromref.current?.getBoundingClientRect(),
    toPos: e.toref.current?.getBoundingClientRect(),
  }));
}

export function isParentMapFullCovered(
  history: PageHistory,
  mr: MapResultType
): boolean {
  for (const [index, item] of history.items.entries()) {
    if (index > 0 && mr[item.pathtext] === MapCoverType.FULL) {
      return true;
    }
  }
  return false;
}

export function getMappedList(mapSet: MapSet): Set<string> {
  const set = new Set<string>();
  for (const x in mapSet.mappings) {
    const map = mapSet.mappings[x];
    for (const y in map) {
      set.add(y);
    }
  }
  return set;
}
