import React from 'react';

export type VersionStatus = 'same' | 'add' | 'delete' | 'change';

/**
 * The difference between two versions of the model
 */
export interface VersionState {
  orielements: Record<string, Record<string, VersionStatus>>;
  refelements: Record<string, Record<string, VersionStatus>>;
  oricomments: Record<string, Record<string, string[]>>;
  refcomments: Record<string, Record<string, string[]>>;
  oriedges: Record<string, Record<string, VersionStatus>>;
  refedges: Record<string, Record<string, VersionStatus>>;
  oripages: Record<string, boolean>;
  refpages: Record<string, boolean>;
  viewOptionRef: React.MutableRefObject<boolean>;
}
