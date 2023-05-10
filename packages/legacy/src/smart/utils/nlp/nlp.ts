import { ArrowHeadType, Edge, Elements, Node } from 'react-flow-renderer';
import { isEditorProcess } from '../../model/editormodel';
import { ModelWrapper } from '../../model/modelwrapper';
import {
  NLPItem,
  NLPJSON,
  NLPToken,
  NLPTreeNode,
  ProvisionRDF,
  RDFVersion,
  STNode,
  STRelation,
} from '../../model/SemanticTriple';
import * as Logger from '../../../lib/logger';

const nlpServer = 'http://localhost:9000';
const width = 180;
const height = 70;

export async function parseText(text: string): Promise<string> {
  if (text !== '') {
    const requestOptions = {
      method : 'POST',
      body   : text,
    };
    const reponse = await fetch(nlpServer, requestOptions);
    return reponse.text();
  }
  return '';
}

function createSTNode(data: string): STNode {
  return {
    data,
    relationship : [],
  };
}

function createSTRelationship(r: string, connect: string): STRelation {
  if (r === 'amod') {
    r = 'is';
  } else if (r === 'nsubj') {
    r = 'subject';
  } else if (r === 'obj') {
    r = 'object';
  }
  return { relationship : r, connect };
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
      Logger.log(error.message);
      Logger.log(error.stack);
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
      if (r.relationship === 'subject') {
        found = true;
      }
    }
    if (!found) {
      map[-1] = createSTNode(role);
      node.relationship.push(createSTRelationship('subject', role));
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

export function converQuestionRDF(
  x: NLPItem
): [Record<string, STNode>, string] {
  const tokens = x.tokens;
  Logger.log('Number of tokens:', tokens.length);
  Logger.log(tokens.map(x => x.lemma).join(','));
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
  Logger.log('Root:', root);
  const node = map[root];
  map[0] = createSTNode(node.data);
  node.relationship.push(createSTRelationship('action', node.data));
  node.data = 'questionRoot';

  const nodes: Record<string, STNode> = {};
  for (const x of Object.values(map)) {
    const key = x.data;
    if (nodes[key] === undefined) {
      nodes[key] = x;
    } else {
      nodes[key].relationship.push(...x.relationship);
    }
  }
  Logger.log('Return:', nodes, 'questionRoot');
  return [nodes, 'questionRoot'];
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
      Logger.log(error.message);
      Logger.log(error.stack);
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
    roots   : {},
    nodes   : {},
    version : RDFVersion,
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
  const elms: Record<string, NLPTreeNode> = {};
  const edges: Record<string, Edge> = {};
  const roots: NLPTreeNode[] = [];
  for (const rs of Object.values(rdf.roots)) {
    for (const x of rs) {
      roots.push(exploreNode(x, elms, edges, rdf.nodes));
    }
  }
  Logger.log(
    'Stats: Number of nodes',
    Object.values(elms).length,
    'Number of edges',
    Object.values(edges).length
  );
  assignLoc(roots);
  return [...Object.values(elms).map(x => x.data), ...Object.values(edges)];
}

function assignLoc(elms: NLPTreeNode[]) {
  let x = 0;
  const y = 0;
  for (const node of elms) {
    if (!node.checked) {
      x += assignNode(node, x, y);
    }
  }
}

function assignNode(node: NLPTreeNode, x: number, y: number): number {
  node.checked = true;
  node.data.position = { x : x * width, y : y * height };
  const ret = 1;
  let level = 0;
  for (const u of node.childs) {
    if (!u.checked) {
      level += assignNode(u, x + level, y + 1);
    }
  }
  return Math.max(ret, level);
}

function exploreNode(
  id: string,
  elms: Record<string, NLPTreeNode>,
  edges: Record<string, Edge>,
  rdf: Record<string, STNode>
): NLPTreeNode {
  const x = rdf[id];
  if (x === undefined) {
    // the node cannot be added for some. Need to investigate
    Logger.log('undefined', id);
    const nnode = createNode(id, 0, 0, id);
    return { data : nnode, childs : []};
  }
  if (elms[x.data] === undefined) {
    const n: NLPTreeNode = {
      data   : createNode(x.data, 0, 0, x.data),
      childs : [],
    };
    elms[x.data] = n;
    const elm = elms[x.data];
    for (const r of x.relationship) {
      const next = exploreNode(r.connect, elms, edges, rdf);
      const id = elm.data.id + '-' + next.data.id;
      if (edges[id] === undefined) {
        edges[id] = createEdge(id, elm.data.id, next.data.id, r.relationship);
        n.childs.push(next);
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
    position : { x, y },
    data     : {
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
    type          : 'straight',
    arrowHeadType : ArrowHeadType.Arrow,
    label,
  };
}
