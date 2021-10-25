export type MMELRepo = string;

export type RepoIndex = Record<string, RepoItem>;

export type RepoItem = {
  shortname: string;
  title: string;
  date: Date;
};

export const repoIndexPath = '/index.json';
