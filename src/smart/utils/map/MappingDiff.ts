import { SerializedStyles } from '@emotion/react';
import { Edge, Elements, Node, Position } from 'react-flow-renderer';
import { map_style_diff__coverage } from '../../../css/visual';
import { MappingType, MapProfile } from '../../model/mapmodel';
import { MMELRepo, RepoIndex } from '../../model/repo';
import { LegendInterface } from '../../model/States';
import { createNodeContent } from '../../ui/mapper/repo/RepoMapNode';
import { calculateDocumentMapping } from '../DocumentFunctions';
import {
  createEdge,
  RepoDiffLegend,
  RepoNodeDiffType,
} from '../repo/CommonFunctions';
import { getPathByNS, RepoFileType } from '../repo/io';
import { MapCoverType, MapDiffEdgeResult, MapEdgeResult, MapResultType } from './MappingCalculator';

export const MapDiffSourceValues = [
  'new',
  'delete',
  'same',
  'change',
  'no',
] as const;

export const MapDiffCoverValues = [
  'new',
  'delete',
  'cover',
  'partial',
  'no'
]

export type MapDiffSourceType = typeof MapDiffSourceValues[number];
export type MapDiffCoverType = typeof MapDiffCoverValues[number];

export const MappingDiffSourceStyles: Record<
  MapDiffSourceType,
  LegendInterface
> = {
  new: { label: 'New source', color: 'lightgreen' },
  delete: { label: 'Deleted source', color: 'lightpink' },
  same: { label: 'Same mapping', color: 'lightblue' },
  change: { label: 'Changed', color: 'lightyellow' },    
  no: { label: 'Not a source', color: 'lightgray' },
};

export const MappingDiffResultStyles: Record<MapDiffCoverType, LegendInterface> = {
  new: { label: 'New coverage', color: 'lightgreen' },
  delete: { label: 'Deleted coverage', color: 'lightpink' },
  cover: { label: 'Covered in both', color: 'lightblue' },
  partial: { label: 'Some mappings inside', color: 'lightyellow' },  
  no: { label: 'Not covered in both', color: 'lightgray' },
};

type Maps = Record<string, MapProfile>;
type Nodes = Record<string, Node>;

const WIDTH = 200;
const HEIGHT = 60;

export function calEdgeDiff(
  current: MapEdgeResult[],
  old: MapEdgeResult[]
): MapDiffEdgeResult[] {
  const result: MapDiffEdgeResult[] = [];
  const visited: Record<string, Set<string>> = {};
  const records: Record<string, Record<string, MapEdgeResult>> = {};
  for (const x of current) {
    if (visited[x.toid] === undefined) {
      visited[x.toid] = new Set<string>();
      records[x.toid] = {};
    }
    visited[x.toid].add(x.fromid);
    records[x.toid][x.fromid] = x;
  }
  for (const x of old) {
    if (visited[x.toid] === undefined) {
      result.push({ ...x, type: 'delete' });
    } else {
      const set = visited[x.toid];
      if (set.has(x.fromid)) {
        result.push({ ...records[x.toid][x.fromid], type: 'same' });
        set.delete(x.fromid);
      } else {
        result.push({ ...x, type: 'delete' });
      }
    }
  }
  for (const x in visited) {
    for (const y of visited[x]) {
      result.push({ ...records[x][y], type: 'new' });
    }
  }
  return result;
}

export function repoMapDiffNode(
  repo: MMELRepo,
  index: RepoIndex,
  map: MapProfile,
  maps: Maps,
  diffMap: MapProfile,
  loadModel: (x: string) => void
): Elements {
  const { ns } = repo;
  const item = index[ns];
  const elms: Record<string, Node> = {
    [ns]: createNode(
      ns,
      0,
      0,
      createNodeContent(item.shortname, undefined, loadModel),
      undefined
    ),
  };
  const edges: Edge[] = [];
  exploreNodes([ns], index, map, maps, diffMap, elms, edges, 1, loadModel);
  return [...Object.values(elms), ...edges];
}

function checkDiffMap(
  mappings: MappingType,
  diffMap: MapProfile,
  namespace: string
): RepoNodeDiffType {
  const ms = diffMap.mapSet[namespace];
  if (ms !== undefined && Object.values(ms.mappings).length > 0) {
    return compareMappings(mappings, ms.mappings);
  }
  return 'new';
}

function compareMappings(m1: MappingType, m2: MappingType): RepoNodeDiffType {
  const index1 = calculateDocumentMapping(m1);
  const index2 = calculateDocumentMapping(m2);

  const froms1 = Object.keys(index1);
  if (froms1.length !== Object.values(index2).length) {
    return 'different';
  }
  for (const f1 of froms1) {
    if (index2[f1] === undefined) {
      return 'different';
    }
  }
  return 'same';
}

function exploreNodes(
  ns: string[],
  index: RepoIndex,
  map: MapProfile,
  maps: Maps,
  diffMap: MapProfile,
  elms: Nodes,
  edges: Edge[],
  col: number,
  loadModel: (x: string) => void
) {
  const next: string[] = [];
  for (const x of ns) {
    const mp = col === 1 ? map : maps[getPathByNS(x, RepoFileType.MAP)];
    if (mp !== undefined) {
      for (const ref of Object.values(mp.mapSet)) {
        if (ref.id !== 'defaultns') {
          if (Object.values(ref.mappings).length > 0) {
            const namespace = ref.id;
            edges.push(createEdge(`${x}-${namespace}`, x, namespace));
            if (elms[namespace] === undefined) {
              const item = index[namespace];
              const nodeContent = createNodeContent(
                item ? item.shortname : namespace,
                item,
                loadModel
              );
              elms[namespace] = createNode(
                namespace,
                WIDTH * col,
                HEIGHT * next.length,
                nodeContent,
                col === 1
                  ? checkDiffMap(ref.mappings, diffMap, namespace)
                  : undefined
              );
              next.push(namespace);
            }
          }
        }
      }
    }
    // add the mapped contents from another model
    if (col === 1) {
      for (const ref of Object.values(diffMap.mapSet)) {
        if (ref.id !== 'defaultns') {
          if (Object.values(ref.mappings).length > 0) {
            const namespace = ref.id;
            if (elms[namespace] === undefined) {
              edges.push(createEdge(`${x}-${namespace}`, x, namespace));
              const item = index[namespace];
              const nodeContent = createNodeContent(
                item ? item.shortname : namespace,
                item,
                loadModel
              );
              elms[namespace] = createNode(
                namespace,
                WIDTH * col,
                HEIGHT * next.length,
                nodeContent,
                'delete'
              );
              next.push(namespace);
            }
          }
        }
      }
    }
  }
  if (next.length !== 0) {
    exploreNodes(
      next,
      index,
      map,
      maps,
      diffMap,
      elms,
      edges,
      col + 1,
      loadModel
    );
  }
}

function createNode(
  id: string,
  x: number,
  y: number,
  label: JSX.Element | string,
  type: RepoNodeDiffType | undefined
): Node {
  return {
    id,
    position: { x, y },
    data: {
      label,
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      background: type ? RepoDiffLegend[type].color : 'lightgray',
    },
  };
}

export function getMapDiffStyleById(
  isParentFull: boolean,
  isDiffParentFull: boolean,
  mapResult: MapResultType, 
  diffMapResult: MapResultType, 
  id: string
): SerializedStyles {  
  const result1 = isParentFull ? MapCoverType.FULL : (mapResult[id]??MapCoverType.NONE);
  const result2 = isDiffParentFull ? MapCoverType.FULL : (diffMapResult[id]??MapCoverType.NONE);
  const covered1 = [MapCoverType.FULL, MapCoverType.PASS].includes(result1);
  const covered2 = [MapCoverType.FULL, MapCoverType.PASS].includes(result2);
  if (covered1 && covered2) {
    return map_style_diff__coverage('cover');
  } else if (covered1) {
    return map_style_diff__coverage('new');
  } else if (covered2) {
    return map_style_diff__coverage('delete');
  }
  if (result1 === MapCoverType.NONE && result2 === MapCoverType.NONE) {
    return map_style_diff__coverage('no');
  }
  return map_style_diff__coverage('partial');
}