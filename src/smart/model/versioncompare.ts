import React from 'react';

export type VersionStatus = 'same' | 'add' | 'delete' | 'change';

export interface VersionState {
  orielements: Record<string, Record<string, VersionStatus>>;
  refelements: Record<string, Record<string, VersionStatus>>;
  oriedges: Record<string, Record<string, VersionStatus>>;
  refedges: Record<string, Record<string, VersionStatus>>;
  oripages: Record<string, boolean>;
  refpages: Record<string, boolean>;
  viewOptionRef: React.MutableRefObject<boolean>;
}
