import { Edge, Elements, Node, Position } from 'react-flow-renderer';
import { MapProfile } from '../../model/mapmodel';
import { MMELRepo, RepoIndex } from '../../model/repo';
import { createNodeContent } from '../../ui/mapper/repo/RepoMapNode';
import { RepoMapLegend, RepoNodeType } from '../repo/CommonFunctions';
import { getPathByNS, RepoFileType } from '../repo/io';

type Maps = Record<string, MapProfile>;
type Nodes = Record<string, Node>;

const WIDTH = 200;
const HEIGHT = 60;

export function repoMapExploreNode(
  repo: MMELRepo,
  index: RepoIndex,
  maps: Maps,
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
      'own'
    ),
  };
  const edges: Edge[] = [];
  exploreNodes([ns], index, maps, elms, edges, 1, loadModel);
  return [...Object.values(elms), ...edges];
}

function exploreNodes(
  ns: string[],
  index: RepoIndex,
  maps: Maps,
  elms: Nodes,
  edges: Edge[],
  col: number,
  loadModel: (x: string) => void
) {
  const next: string[] = [];
  for (const x of ns) {
    const mp = maps[getPathByNS(x, RepoFileType.MAP)];
    if (mp !== undefined) {
      for (const ref of Object.values(mp.mapSet)) {
        if (ref.id !== 'defaultns') {
          if (Object.values(ref.mappings).length > 0) {
            const namespace = ref.id;
            edges.push(createEdge(`${x}-${namespace}`, x, namespace));
            const item = index[namespace];
            const nodeContent = createNodeContent(
              item ? item.shortname : namespace,
              item,
              loadModel
            );
            if (elms[namespace] === undefined) {
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
    exploreNodes(next, index, maps, elms, edges, col + 1, loadModel);
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
    position: { x, y },
    data: {
      label,
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      background: RepoMapLegend[type].color,
    },
  };
}

function createEdge(id: string, source: string, target: string): Edge {
  return {
    id,
    source,
    target,
    type: 'repo',
  };
}
