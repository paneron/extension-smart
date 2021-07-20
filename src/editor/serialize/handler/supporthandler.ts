import { DataType } from '../interface/baseinterface';
import {
  MMELMetadata,
  MMELProvision,
  MMELReference,
  MMELRole,
  MMELVariable,
  ParsingProvision,
} from '../interface/supportinterface';
import { MMELremovePackage, MMELtokenizePackage } from '../util/tokenizer';

export function parseMetaData(x: string): MMELMetadata {
  const meta: MMELMetadata = {
    schema: '',
    author: '',
    title: '',
    edition: '',
    namespace: '',
    datatype: DataType.METADATA,
  };
  if (x !== '') {
    const t: Array<string> = MMELtokenizePackage(x);
    let i = 0;
    while (i < t.length) {
      const command: string = t[i++];
      if (i < t.length) {
        if (command === 'title') {
          meta.title = MMELremovePackage(t[i++]);
        } else if (command === 'schema') {
          meta.schema = MMELremovePackage(t[i++]);
        } else if (command === 'edition') {
          meta.edition = MMELremovePackage(t[i++]);
        } else if (command === 'author') {
          meta.author = MMELremovePackage(t[i++]);
        } else if (command === 'namespace') {
          meta.namespace = MMELremovePackage(t[i++]);
        } else {
          throw new Error(
            'Parsing error: metadata. Unknown keyword ' + command
          );
        }
      } else {
        throw new Error(
          'Parsing error: metadata. Expecting value for ' + command
        );
      }
    }
  }
  return meta;
}

export function parseProvision(id: string, data: string): ParsingProvision {
  const pro: MMELProvision = {
    subject: new Map<string, string>(),
    id: id,
    modality: '',
    condition: '',
    ref: [],
    datatype: DataType.PROVISION,
  };
  const container: ParsingProvision = {
    content: pro,
    p_ref: [],
  };

  if (data !== '') {
    const t: Array<string> = MMELtokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const command: string = t[i++];
      if (i < t.length) {
        if (command === 'modality') {
          pro.modality = t[i++];
        } else if (command === 'condition') {
          pro.condition = MMELremovePackage(t[i++]);
        } else if (command === 'reference') {
          container.p_ref = MMELtokenizePackage(t[i++]);
        } else {
          pro.subject.set(command, t[i++]);
        }
      } else {
        throw new Error(
          'Parsing error: provision. ID ' +
            id +
            ': Expecting value for ' +
            command
        );
      }
    }
  }
  return container;
}

export function resolveProvision(
  container: ParsingProvision,
  idreg: Map<string, MMELReference>
): MMELProvision {
  const pro = container.content;
  for (const x of container.p_ref) {
    const y = idreg.get(x);
    if (y !== undefined) {
      pro.ref.push(y);
    } else {
      throw new Error(
        'Error in resolving IDs in reference for provision ' + pro.id
      );
    }
  }
  return pro;
}

export function parseReference(id: string, data: string): MMELReference {
  const ref: MMELReference = {
    id: id,
    document: '',
    clause: '',
    datatype: DataType.REFERENCE,
  };

  if (data !== '') {
    const t: Array<string> = MMELtokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const command: string = t[i++];
      if (i < t.length) {
        if (command === 'document') {
          ref.document = MMELremovePackage(t[i++]);
        } else if (command === 'clause') {
          ref.clause = MMELremovePackage(t[i++]);
        } else {
          throw new Error(
            'Parsing error: reference. ID ' +
              id +
              ': Unknown keyword ' +
              command
          );
        }
      } else {
        throw new Error(
          'Parsing error: reference. ID ' +
            id +
            ': Expecting value for ' +
            command
        );
      }
    }
  }
  return ref;
}

export function parseRole(id: string, data: string): MMELRole {
  const role: MMELRole = {
    id: id,
    name: '',
    datatype: DataType.ROLE,
  };
  const t: Array<string> = MMELtokenizePackage(data);
  let i = 0;
  while (i < t.length) {
    const command: string = t[i++];
    if (i < t.length) {
      if (command === 'name') {
        role.name = MMELremovePackage(t[i++]);
      } else {
        throw new Error(
          'Parsing error: role. ID ' + id + ': Unknown keyword ' + command
        );
      }
    } else {
      throw new Error(
        'Parsing error: role. ID ' + id + ': Expecting value for ' + command
      );
    }
  }
  return role;
}

export function parseVariable(id: string, data: string): MMELVariable {
  const v: MMELVariable = {
    id: id,
    type: '',
    definition: '',
    description: '',
    datatype: DataType.VARIABLE,
  };

  if (data !== '') {
    const t: Array<string> = MMELtokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const command: string = t[i++];
      if (i < t.length) {
        if (command === 'type') {
          v.type = t[i++];
        } else if (command === 'definition') {
          v.definition = MMELremovePackage(t[i++]);
        } else if (command === 'description') {
          v.description = MMELremovePackage(t[i++]);
        } else {
          throw new Error(
            'Parsing error: variable. ID ' + id + ': Unknown keyword ' + command
          );
        }
      } else {
        throw new Error(
          'Parsing error: variable. ID ' +
            id +
            ': Expecting value for ' +
            command
        );
      }
    }
  }
  return v;
}
