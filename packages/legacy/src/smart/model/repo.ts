/**
 * Data structure for repo items
 */
export type RepoItemType = RepoItems['type'];
export type RepoItems = RepoImpItem | RepoRefItem | RepoDocItem;

export type MMELRepo = {
  ns: string;
  type: RepoItemType;
};

export type RepoIndex = Record<string, RepoItems>;

export type RepoImpItem = RepoBase & { type: 'Imp' }; // implementation model
export type RepoRefItem = RepoBase & { type: 'Ref' }; // reference model
export type RepoDocItem = RepoBase & { type: 'Doc' }; // documents

type RepoBase = {
  namespace: string;
  shortname: string;
  title: string;
  date: Date;
};

/**
 * It is like an index of the file system, to identify and keep track of objects in Paneron
 */
export const repoIndexPath = '/index.json';
