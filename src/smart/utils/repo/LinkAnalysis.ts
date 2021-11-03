import { Edge, Elements, Node, Position } from 'react-flow-renderer';
import { ModelWrapper } from '../../model/modelwrapper';
import { MMELRepo, RepoIndex } from '../../model/repo';
import { createNodeContent } from '../../ui/mapper/repo/RepoMapNode';
import { RepoLegend, RepoNodeType } from '../repo/CommonFunctions';
import { getPathByNS, RepoFileType } from './io';

type Nodes = Record<string, Node>;
type Edges = Record<string, Edge>;

const WIDTH = 200;
const HEIGHT = 60;

export function repoLinkExploreNode(
  index: RepoIndex,
  repo: MMELRepo,
  models?: Record<string, ModelWrapper>
): Elements {
  if (models) {
    const ns = repo.ns;
    const item = index[ns];
    const elms: Record<string, Node> = {
      [ns]: createNode(
        ns,
        0,
        0,
        createNodeContent(item.shortname, undefined),
        'own'
      ),
    };
    const edges: Edges = {};
    exploreNodes([ns], index, models, elms, edges, 1);
    return [...Object.values(elms), ...Object.values(edges)];
  } else {
    return [];
  }
}

function exploreNodes(
  ns: string[],
  index: RepoIndex,
  models: Record<string, ModelWrapper>,
  elms: Nodes,
  edges: Edges,
  col: number
) {
  const next: string[] = [];
  for (const x of ns) {
    const model = models[getPathByNS(x, RepoFileType.MODEL)];
    if (model !== undefined) {
      for (const link of Object.values(model.model.links)) {
        if (link.type === 'REPO') {
          const ref = link.link;
          const nodeContent = createNodeContent(ref, undefined);
          const edgeId = `${x}-${ref}`;
          if (edges[edgeId] === undefined) {
            edges[edgeId] = createEdge(edgeId, x, ref);
          }
          if (elms[ref] === undefined) {
            elms[ref] = createNode(
              ref,
              WIDTH * col,
              HEIGHT * next.length,
              nodeContent,
              index[ref] !== undefined ? 'repo' : 'outside'
            );
            next.push(ref);
          }
        }
      }
    }
  }
  if (next.length !== 0) {
    exploreNodes(next, index, models, elms, edges, col + 1);
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
      background: RepoLegend[type].color,
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
