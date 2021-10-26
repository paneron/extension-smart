import {
  RepoDocItem,
  RepoImpItem,
  RepoIndex,
  RepoItem,
  RepoRefItem,
} from '../../model/repo';

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
