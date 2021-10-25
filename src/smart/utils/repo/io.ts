export enum RepoFileType {
  MODEL = 'model',
  MAP = 'map',
}

const FileExts: Record<RepoFileType, string> = {
  [RepoFileType.MODEL]: 'mmel',
  [RepoFileType.MAP]: 'map',
};

export function getPathByNS(ns: string, type: RepoFileType) {
  return `/${type}/${ns}.${FileExts[type]}`;
}