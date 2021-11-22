import { Edge, Node, Position } from 'react-flow-renderer';
import { MapProfile } from '../../model/mapmodel';
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
            if (tos[namespace] === undefined) {
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
