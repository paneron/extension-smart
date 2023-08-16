/**
 * Data model for the NLP graph
 */

import { Node } from 'react-flow-renderer';

export interface STNode {
  data: string;
  relationship: STRelation[];
}

export interface STRelation {
  relationship: string;
  connect: string;
}

export const RDFVersion = '0.0.1';

export interface ProvisionRDF {
  // roots[provision.id]
  roots: Record<string, string[]>;
  nodes: Record<string, STNode>;
  version: typeof RDFVersion;
}

export interface NLPJSON {
  sentences: NLPItem[];
}

export interface NLPItem {
  enhancedPlusPlusDependencies: NLPDependency[];
  tokens: NLPToken[];
}

export interface NLPDependency {
  dep: string;
  dependent: number;
  governor: number;
}

export interface NLPToken {
  word: string;
  lemma: string;
}

export interface NLPTreeNode {
  data: Node;
  childs: NLPTreeNode[];
  width?: number;
  checked?: true;
}
