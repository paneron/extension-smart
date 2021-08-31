export interface SMARTDocument {
  id: number;
  name: string;
  attributes: Record<string, string>; // according to the definition of the data registry
}

// docs[random number document id]
export interface SMARTDocumentStore {
  id: string; // id of data registry
  docs: Record<number, SMARTDocument>;
}

// store[registry id]
export interface SMARTModelStore {
  id: string; // namespace of the model
  store: Record<string, SMARTDocumentStore>;
}

// docs[model namespace]
export interface SMARTWorkspace {
  docs: Record<string, SMARTModelStore>;
}

export function createNewSMARTWorkspace(): SMARTWorkspace {
  return {
    docs: {},
  };
}
