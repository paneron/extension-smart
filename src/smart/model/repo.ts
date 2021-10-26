export type RepoItemType = RepoItem['type'];
export type RepoItem = RepoImpItem | RepoRefItem | RepoDocItem;

export type MMELRepo = {
  ns: string;
  type: RepoItemType;
};

export type RepoIndex = Record<string, RepoItem>;

export type RepoImpItem = RepoBase & { type: 'Imp' };
export type RepoRefItem = RepoBase & { type: 'Ref' };
export type RepoDocItem = RepoBase & { type: 'Doc' };

type RepoBase = {
  namespace: string;
  shortname: string;
  title: string;
  date: Date;
};

export const repoIndexPath = '/index.json';
