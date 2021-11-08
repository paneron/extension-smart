import { ArrowHeadType, Edge, Elements, Node } from 'react-flow-renderer';
import { isEditorProcess } from '../../model/editormodel';
import { ModelWrapper } from '../../model/modelwrapper';
import {
  NLPItem,
  NLPJSON,
  NLPToken,
  ProvisionRDF,
  RDFVersion,
  STNode,
  STRelation,
} from '../../model/SemanticTriple';
import { Logger } from '../ModelFunctions';

const nlpServer = 'http://localhost:9000';

async function parseText(text: string): Promise<string> {
  if (text !== '') {
    const requestOptions = {
      method: 'POST',
      body: text,
    };
    const reponse = await fetch(nlpServer, requestOptions);
    return reponse.text();
  }
  return '';
}

function createSTNode(data: string): STNode {
  return {
    data,
    relationship: [],
  };
}

function createSTRelationship(r: string, connect: string): STRelation {
  if (r === 'amod') {
    r = 'is';
  }
  return { relationship: r, connect };
}

function getSTNode(
  map: Record<number, STNode>,
  num: number,
  tokens: NLPToken[]
): STNode {
  try {
    if (map[num] === undefined) {
      map[num] = createSTNode(tokens[num - 1].lemma);
    }
  } catch (e: unknown) {
    if (typeof e === 'object') {
      const error = e as Error;
      Logger.logger.log(error.message);
      Logger.logger.log(error.stack);
    }
  }
  return map[num];
}

function addProcessInfo(
  id: string,
  role: string,
  modality: string,
  map: Record<number, STNode>,
  root: number
) {
  const node = map[root];
  if (role !== '') {
    let found = false;
    for (const r of node.relationship) {
      if (r.relationship === 'nsubj') {
        found = true;
      }
    }
    if (!found) {
      map[-1] = createSTNode(role);
      node.relationship.push(createSTRelationship('nsubj', role));
    }
  }
  if (modality !== '') {
    map[0] = createSTNode(modality);
    node.relationship.push(createSTRelationship('modaliity', modality));
  }
  map[-2] = createSTNode(node.data);
  node.relationship.push(createSTRelationship('action', node.data));
  node.data = id;
}

function convertRDF(
  x: NLPItem,
  id: string,
  role: string,
  modality: string,
  nodes: Record<string, STNode>
): string {
  try {
    const tokens = x.tokens;
    if (tokens.length === 1) {
      return '';
    }
    const deps = x.enhancedPlusPlusDependencies;
    const map: Record<number, STNode> = {};
    let root = 0;
    for (const y of deps) {
      if (y.governor === 0) {
        root = y.dependent;
      } else if (y.dep !== 'punct' && y.dep !== 'det') {
        const from = getSTNode(map, y.governor, tokens);
        const to = getSTNode(map, y.dependent, tokens);
        from.relationship.push(createSTRelationship(y.dep, to.data));
      }
    }
    // add subject and modality as appropriate
    if (root !== 0) {
      addProcessInfo(id, role, modality, map, root);
    }

    for (const x of Object.values(map)) {
      const key = x.data;
      if (nodes[key] === undefined) {
        nodes[key] = x;
      } else {
        nodes[key].relationship.push(...x.relationship);
      }
    }
    return root !== 0 ? id : '';
  } catch (e: unknown) {
    if (typeof e === 'object') {
      const error = e as Error;
      Logger.logger.log(error.message);
      Logger.logger.log(error.stack);
    }
    return '';
  }
}

function convertRDFs(
  data: string,
  pid: string,
  rolename: string,
  modality: string,
  rdf: ProvisionRDF
): void {
  const json = JSON.parse(data) as NLPJSON;
  const roots = json.sentences
    .map(x => convertRDF(x, pid, rolename, modality, rdf.nodes))
    .filter(x => x !== '');
  rdf.roots[pid] = roots;
}

export async function computeRDF(mw: ModelWrapper): Promise<ProvisionRDF> {
  const rdf: ProvisionRDF = {
    roots: {},
    nodes: {},
    version: RDFVersion,
  };
  const model = mw.model;
  for (const p of Object.values(model.elements)) {
    if (isEditorProcess(p)) {
      const rolename = p.actor !== '' ? model.roles[p.actor].name : '';
      for (const x of p.provision) {
        const provision = model.provisions[x];
        const text = await parseText(provision.condition);
        convertRDFs(text, x, rolename, provision.modality, rdf);
      }
    }
  }
  return rdf;
}

export function getElementsFromRDF(
  rdf: ProvisionRDF | undefined | null
): Elements {
  if (rdf === undefined || rdf === null) {
    return [];
  }
  const elms: Record<string, Node> = {};
  const edges: Record<string, Edge> = {};
  for (const rs of Object.values(rdf.roots)) {
    for (const x of rs) {
      exploreNode(x, elms, edges, rdf.nodes);
    }
  }
  Logger.logger.log(
    'Stats: Number of nodes',
    Object.values(elms).length,
    'Number of edges',
    Object.values(edges).length
  );
  return [...Object.values(elms), ...Object.values(edges)];
}

function exploreNode(
  id: string,
  elms: Record<string, Node>,
  edges: Record<string, Edge>,
  rdf: Record<string, STNode>
): Node | Edge {
  const x = rdf[id];
  if (x === undefined) {
    // the node cannot be added for some. Need to investigate
    Logger.logger.log('undefined', id);
    return createNode(id, 0, 0, id);
  }
  if (elms[x.data] === undefined) {
    const n = createNode(x.data, 0, 0, x.data);
    elms[x.data] = n;
    const elm = elms[x.data];
    for (const r of x.relationship) {
      const next = exploreNode(r.connect, elms, edges, rdf);
      const id = elm.id + '-' + next.id;
      if (edges[id] === undefined) {
        edges[id] = createEdge(id, elm.id, next.id, r.relationship);
      } else {
        const edge = edges[id];
        const elabel: string = edge.label as string;
        const types = elabel.split(',');
        if (!types.includes(r.relationship)) {
          edge.label = `${elabel},${r.relationship}`;
        }
      }
    }
  }
  return elms[x.data];
}

function createNode(id: string, x: number, y: number, label: string): Node {
  return {
    id,
    position: { x, y },
    data: {
      label,
    },
  };
}

function createEdge(
  id: string,
  source: string,
  target: string,
  label: string
): Edge {
  return {
    id,
    source,
    target,
    type: 'straight',
    arrowHeadType: ArrowHeadType.Arrow,
    label,
  };
}
