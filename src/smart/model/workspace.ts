export interface SMARTDocument {
  id: number;
  name: string;
  attributes: Record<string, string>;
}

export interface SMARTDocumentStore {
  id: string;
  docs: Record<number, SMARTDocument>;
}

export interface SMARTModelStore {
  id: string;
  store: SMARTDocumentStore;
}

export interface SMARTWorkspace {
  docs: Record<string, SMARTModelStore>;
}

export function createNewSMARTWorkspace():SMARTWorkspace {
  return {
    docs: {}
  };
}