/**
 * It is the data model of how data instances are stored and associated to the model
 */

import type { IObject } from '@/smart/ui/common/listmanagement/listPopoverItem';
import { WSVERSION } from '@/smart/utils/constants';
import type { JSONContextType } from '@/smart/utils/repo/io';
import { JSONContext } from '@/smart/utils/repo/io';

export interface SMARTDocument extends IObject {
  name: string;
  // according to the definition of the data registry
  attributes: Record<string, string>;
}

// docs[random number document id]
export interface SMARTDocumentStore extends IObject {
  // id: string; // id of data registry
  docs: Record<number, SMARTDocument | undefined>;
}

// store[registry id]
export interface SMARTModelStore extends IObject {
  // id: string; // namespace of the model
  store: Record<string, SMARTDocumentStore>;
}

// docs[model namespace]
export interface SMARTWorkspace {
  '@context': JSONContextType;
  '@type': 'MMEL_WORKSPACE';
  docs: Record<string, SMARTModelStore>;
  version: string;
}

export function createNewSMARTWorkspace(): SMARTWorkspace {
  return {
    '@context' : JSONContext,
    '@type'    : 'MMEL_WORKSPACE',
    'docs'     : {},
    'version'  : WSVERSION,
  };
}
