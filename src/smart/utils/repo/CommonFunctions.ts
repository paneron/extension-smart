import { Edge } from 'react-flow-renderer';
import {
  RepoDocItem,
  RepoImpItem,
  RepoIndex,
  RepoItem,
  RepoRefItem,
} from '../../model/repo';
import { LegendInterface } from '../../model/States';
import { getPathByNS, RepoFileType } from './io';

export type RepoNodeType = 'own' | 'repo' | 'outside';

export type RepoNodeDiffType = 'new' | 'delete' | 'same' | 'different';

export const RepoLegend: Record<RepoNodeType, LegendInterface> = {
  own: { label: 'Current model', color: 'lightgreen' },
  repo: { label: 'In repository', color: 'lightblue' },
  outside: { label: 'Not in repository', color: 'lightgray' },
};

export const RepoDiffLegend: Record<RepoNodeDiffType, LegendInterface> = {
  new: { label: 'New coverage', color: 'lightgreen' },
  different: { label: 'Changed coverage', color: 'lightyellow' },
  same: { label: 'Same coverage', color: 'lightblue' },
  delete: { label: 'Deleted coverage', color: 'lightpink' },
};

export function setValueToIndex(
  index: RepoIndex,
  ns: string,
  newItem: RepoItem
): RepoIndex {
  return { ...index, [ns]: newItem };
}

export function createEmptyIndex(): RepoIndex {
  return {};
}

export function groupItems(
  index: Record<string, RepoItem>
): [RepoRefItem[], RepoImpItem[], RepoDocItem[]] {
  const refs: RepoRefItem[] = [];
  const imps: RepoImpItem[] = [];
  const docs: RepoDocItem[] = [];
  for (const x of Object.values(index)) {
    if (x.type === 'Doc') {
      docs.push(x);
    } else if (x.type === 'Ref') {
      refs.push(x);
    } else if (x.type === 'Imp') {
      imps.push(x);
    }
  }
  return [refs, imps, docs];
}

export function getAllRepoMaps(index: RepoIndex): string[] {
  const filtered = Object.values(index).filter(
    x => x.type === 'Imp' || x.type === 'Ref'
  );
  return filtered.map(x => getPathByNS(x.namespace, RepoFileType.MAP));
}

export function getAllRepoModels(index: RepoIndex): string[] {
  const filtered = Object.values(index).filter(
    x => x.type === 'Imp' || x.type === 'Ref'
  );
  return filtered.map(x => getPathByNS(x.namespace, RepoFileType.MODEL));
}

export function createEdge(id: string, source: string, target: string): Edge {
  return {
    id,
    source,
    target,
    type: 'repo',
  };
}
