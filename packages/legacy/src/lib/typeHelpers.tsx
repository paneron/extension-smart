
export const isNotUndefined = <T extends object>(item: T | undefined): item is T => {
  return !!item;
};
