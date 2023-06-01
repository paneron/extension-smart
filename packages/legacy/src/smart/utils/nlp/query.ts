import {
  NLPJSON,
  ProvisionRDF,
  RDFVersion,
  STNode,
} from '../../model/SemanticTriple';
import * as Logger from '@/lib/logger';
import { converQuestionRDF, parseText } from '@/smart/utils/nlp/nlp';

const QuestionWords = [
  'what',
  'who',
  'which',
  'when',
  'where',
  'whom',
  'whose',
  'why',
  'how',
] as const;

function hasQuestion(rdf: Record<string, STNode>): number {
  return QuestionWords.reduce((count, x) => count + checkRDF(rdf[x]), 0);
}

function checkRDF(x: STNode | undefined): number {
  if (x === undefined) {
    return 0;
  }
  x.data = '?';
  return 1;
}

function checkSimilarity(
  rdf: Record<string, STNode>,
  u: STNode,
  nodes: Record<string, STNode>,
  v: STNode
): [string, number] {
  let score = 0;
  let answer = '';
  const map: Record<string, STNode> = {};
  for (const n of u.relationship) {
    map[n.relationship + '-' + n.connect] = rdf[n.connect];
  }
  for (const n of v.relationship) {
    const partner = map[n.relationship + '-' + n.connect];
    const own = nodes[n.connect];
    if (own.data === '?') {
      for (const m of u.relationship) {
        if (n.relationship === m.relationship) {
          answer = m.connect;
          score++;
          break;
        }
      }
    } else {
      if (partner !== undefined) {
        score++;
        const [ca, cscore] = checkSimilarity(rdf, partner, nodes, own);
        if (ca !== '') {
          answer = '';
        }
        score += cscore;
      }
    }
  }
  return [answer, score];
}

export async function askRDF(
  rdf: ProvisionRDF,
  q: string,
  solve: (x: string, qrdf: ProvisionRDF | undefined, score?: number) => void
) {
  const text = await parseText(q);
  const json = JSON.parse(text) as NLPJSON;
  if (json.sentences.length > 1) {
    solve('There is more than one sentence in the question', undefined);
    return;
  }
  if (json.sentences.length === 0) {
    solve('There is no question', undefined);
    return;
  }
  const sen = json.sentences[0];
  const [nodes, root] = converQuestionRDF(sen);
  Logger.log('Question:', root, nodes);
  const qword = hasQuestion(nodes);
  if (qword === 0) {
    solve('No question word is found in your question', undefined);
    return;
  }
  if (qword > 1) {
    solve(
      'More than one question word is found. Ask one question at a time.',
      undefined
    );
    return;
  }
  const prdf: ProvisionRDF = {
    roots   : { Question : [root]},
    nodes,
    version : RDFVersion,
  };
  let score = 0;
  let answer = 'No idea';
  for (const x of Object.values(rdf.nodes)) {
    const [a, sim] = checkSimilarity(rdf.nodes, x, nodes, nodes[root]);
    if (sim > score) {
      score = sim;
      answer = a;
    }
  }
  solve(answer, prdf, score);
}
