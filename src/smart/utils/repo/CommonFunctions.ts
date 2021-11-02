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

export const RepoLegend: Record<RepoNodeType, LegendInterface> = {
  own: { label: 'Current model', color: 'lightgreen' },
  repo: { label: 'In repository', color: 'lightblue' },
  outside: { label: 'Not in repository', color: 'lightgray' },
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
