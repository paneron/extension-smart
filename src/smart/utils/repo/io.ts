import { Hooks } from '@riboseinc/paneron-extension-kit/types';

type UpdateObjectType = Hooks.Data.UpdateObjects;
type UseObjectType = Hooks.Data.GetObjectDataset;

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

export async function repoWrite<T>(
  path: string,
  data: T,
  updateObjects: UpdateObjectType
) {
  await updateObjects({
    commitMessage: 'Updating concept',
    objectChangeset: { [path]: { newValue: data } },
  });
}

export function repoRead<T>(
  path: string,
  useObjectData: UseObjectType
): T | null {
  const result = useObjectData({ objectPaths: [path] });
  const value = result.value.data[path];
  if (value === null) {
    return null;
  } else {
    return value as T;
  }
}
