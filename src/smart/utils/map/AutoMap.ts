import { Edge, Node, Position } from 'react-flow-renderer';
import { EditorModel, isEditorProcess } from '../../model/editormodel';
import { MapProfile } from '../../model/mapmodel';
import { ModelWrapper } from '../../model/modelwrapper';
import { MMELRepo, RepoIndex } from '../../model/repo';
import { createEdge, RepoLegend, RepoNodeType } from '../repo/CommonFunctions';
import { getPathByNS, RepoFileType } from '../repo/io';

type Maps = Record<string, MapProfile>;
type Nodes = Record<string, Node>;
type Settings = Record<string, boolean>;

const WIDTH = 200;
const HEIGHT = 60;

export async function repoAutoMapExplore(
  repo: MMELRepo,
  index: RepoIndex,
  map: MapProfile,
  maps: Maps
): Promise<[Record<string, Node>, Edge[], Settings, Settings]> {
  const { ns } = repo;
  const elms: Record<string, Node> = {
    [ns]: createNode(ns, 0, 0, 'own'),
  };
  const edges: Edge[] = [];
  const froms: Settings = {};
  const tos: Settings = {};
  exploreNodes([ns], index, map, maps, elms, edges, 1, froms, tos);
  return [elms, edges, froms, tos];
}

function exploreNodes(
  ns: string[],
  index: RepoIndex,
  map: MapProfile,
  maps: Maps,
  elms: Nodes,
  edges: Edge[],
  col: number,
  froms: Settings,
  tos: Settings
) {
  const next: string[] = [];
  for (const x of ns) {
    let hasMapping = col === 1;
    const mp = col === 1 ? map : maps[getPathByNS(x, RepoFileType.MAP)];
    if (mp !== undefined) {
      for (const ref of Object.values(mp.mapSet)) {
        if (ref.id !== 'defaultns') {
          if (Object.values(ref.mappings).length > 0) {
            const namespace = ref.id;
            if (col !== 1 && tos[namespace] === undefined) {
              tos[namespace] = false;
            }
            edges.push(createEdge(`${x}-${namespace}`, x, namespace));
            if (elms[namespace] === undefined) {
              const item = index[namespace];
              if (!hasMapping) {
                hasMapping = true;
                froms[x] = false;
              }
              elms[namespace] = createNode(
                namespace,
                WIDTH * col,
                HEIGHT * next.length,
                item !== undefined ? 'repo' : 'outside'
              );
              next.push(namespace);
            }
          }
        }
      }
    }
  }
  if (next.length !== 0) {
    exploreNodes(next, index, map, maps, elms, edges, col + 1, froms, tos);
  }
}

function createNode(
  id: string,
  x: number,
  y: number,
  type: RepoNodeType
): Node {
  return {
    id,
    position: { x, y },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      background: RepoLegend[type].color,
    },
  };
}

type VisitRecord = {
  from: string;
  path: string;
};
type VisitedMap = Record<string, Record<string, VisitRecord>>;
type MapOption = Record<string, boolean>;
type UNode = {
  ns: string;
  id: string;
};

function initialVisit(
  map: MapProfile,
  froms: MapOption,
  models: Record<string, ModelWrapper>
): [VisitedMap, UNode[]] {
  const visited: VisitedMap = {};
  const queue: UNode[] = [];
  for (const x in map.mapSet) {
    if (froms[x]) {
      visited[x] = {};
      const mapping = map.mapSet[x].mappings;
      const model = models[getPathByNS(x, RepoFileType.MODEL)];
      for (const f in mapping) {
        for (const t in mapping[f]) {
          const childs = model !== undefined ? getChilds(model.model, t) : [t];
          for (const child of childs) {
            if (visited[x][child] === undefined) {
              visited[x][child] = { from: f, path: `${f} > ${child}` };
              queue.push({ ns: x, id: child });
            }
          }
        }
      }
    }
  }
  return [visited, queue];
}

function visitNode(
  node: UNode,
  maps: Maps,
  froms: MapOption,
  tos: MapOption,
  visited: VisitedMap,
  queue: UNode[],
  mp: MapProfile,
  models: Record<string, ModelWrapper>
): number {
  const { ns, id } = node;
  const mapProfile = maps[getPathByNS(ns, RepoFileType.MAP)];
  if (mapProfile !== undefined) {
    let count = 0;
    const sets = mapProfile.mapSet;
    for (const x in sets) {
      const model = models[getPathByNS(x, RepoFileType.MODEL)];
      if (froms[x] || tos[x]) {
        const mapping = sets[x].mappings[id];
        const { from, path } = visited[ns][id];
        if (mapping !== undefined) {
          for (const t in mapping) {
            if (visited[x] === undefined) {
              visited[x] = {};
            }
            if (visited[x][t] === undefined) {
              visited[x][t] = { from, path: `${path} > ${t}` };
              if (froms[x]) {
                queue.push({ ns: x, id: t });
                const childs =
                  model !== undefined ? getChilds(model.model, t) : [t];
                for (const child of childs) {
                  if (visited[x][child] === undefined) {
                    visited[x][child] = { from, path: `${path} > ${child}` };
                    queue.push({ ns: x, id: child });
                  }
                }
              }
              if (tos[x]) {
                if (mp.mapSet[x] === undefined) {
                  mp.mapSet[x] = { id: x, mappings: {} };
                } else {
                  mp.mapSet[x] = { ...mp.mapSet[x] };
                }
                const mappings = mp.mapSet[x].mappings;
                if (mappings[from] === undefined) {
                  mappings[from] = {};
                } else {
                  mappings[from] = { ...mappings[from] };
                }
                mappings[from][t] = {
                  description: 'Generated by Transitive mapping',
                  justification: `Mapping path: ${visited[x][t].path}`,
                };
                count++;
              }
            }
          }
        }
      }
    }
    return count;
  }
  return 0;
}

export async function repoMapAI(
  map: MapProfile,
  maps: Maps,
  models: Record<string, ModelWrapper>,
  froms: MapOption,
  tos: MapOption
): Promise<[MapProfile, number]> {
  const mp: MapProfile = { ...map };

  // visited[ns][nodeid]= path;
  const [visited, queue] = initialVisit(map, froms, models);
  let count = 0;
  while (queue.length > 0) {
    const node = queue.shift();
    if (node) {
      count += visitNode(node, maps, froms, tos, visited, queue, mp, models);
    }
  }
  return [mp, count];
}

function getChilds(model: EditorModel, id: string): string[] {
  let ret: string[] = [id];
  const elm = model.elements[id];
  if (isEditorProcess(elm) && elm.page !== '') {
    ret = [
      ...ret,
      ...Object.values(model.pages[elm.page].childs).flatMap(e =>
        getChilds(model, e.element)
      ),
    ];
  }
  return ret;
}
