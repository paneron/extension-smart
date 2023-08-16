import { Edge, Elements, Node, Position } from 'react-flow-renderer';
import { MapProfile } from '@/smart/model/mapmodel';
import { MMELRepo, RepoIndex } from '@/smart/model/repo';
import { createNodeContent } from '@/smart/ui/mapper/repo/RepoMapNode';
import {
  createEdge,
  getRepoItemDesc,
  RepoLegend,
  RepoNodeType,
} from '@/smart/utils/repo/CommonFunctions';
import { getPathByNS, RepoFileType } from '@/smart/utils/repo/io';

type Maps = Record<string, MapProfile>;
type Nodes = Record<string, Node>;

const WIDTH = 200;
const HEIGHT = 60;

export function repoMapExploreNode(
  repo: MMELRepo,
  index: RepoIndex,
  map: MapProfile,
  maps: Maps,
  loadModel: (x: string) => void
): Elements {
  const { ns } = repo;
  const item = index[ns];
  const elms: Record<string, Node> = {
    [ns] : createNode(
      ns,
      0,
      0,
      createNodeContent(getRepoItemDesc(item), undefined, loadModel),
      'own'
    ),
  };
  const edges: Edge[] = [];
  exploreNodes([ns], index, map, maps, elms, edges, 1, loadModel);
  return [...Object.values(elms), ...edges];
}

function exploreNodes(
  ns: string[],
  index: RepoIndex,
  map: MapProfile,
  maps: Maps,
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
                item ? getRepoItemDesc(item) : `[${namespace}]`,
                item,
                loadModel
              );
              elms[namespace] = createNode(
                namespace,
                WIDTH * col,
                HEIGHT * next.length,
                nodeContent,
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
    exploreNodes(next, index, map, maps, elms, edges, col + 1, loadModel);
  }
}

function createNode(
  id: string,
  x: number,
  y: number,
  label: JSX.Element | string,
  type: RepoNodeType
): Node {
  return {
    id,
    position : { x, y },
    data     : {
      label,
    },
    sourcePosition : Position.Right,
    targetPosition : Position.Left,
    style          : {
      background : RepoLegend[type].color,
    },
  };
}
