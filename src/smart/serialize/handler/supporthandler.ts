import { DataType } from '../interface/baseinterface';
import {
  MMELMetadata,
  MMELNote,
  MMELProvision,
  MMELReference,
  MMELRole,
  MMELTerm,
  MMELVariable,
  MMELVarSetting,
  MMELView,
  NOTE_TYPE,
  VarType,
} from '../interface/supportinterface';
import {
  MMELremovePackage,
  MMELtokenizePackage,
  MMELtokenizeSet,
} from '../util/tokenizer';

export function parseMetaData(x: string): MMELMetadata {
  const meta: MMELMetadata = {
    schema: '',
    author: '',
    title: '',
    edition: '',
    namespace: '',
    shortname: '',
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
        } else if (command === 'shortname') {
          meta.shortname = MMELremovePackage(t[i++]);
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

export function parseProvision(id: string, data: string): MMELProvision {
  const pro: MMELProvision = {
    subject: {},
    id: id,
    modality: '',
    condition: '',
    ref: new Set<string>(),
    datatype: DataType.PROVISION,
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
          pro.ref = MMELtokenizeSet(t[i++]);
        } else {
          pro.subject[command] = t[i++];
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
  return pro;
}

export function parseReference(id: string, data: string): MMELReference {
  const ref: MMELReference = {
    id: id,
    document: '',
    clause: '',
    title: '',
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
        } else if (command === 'title') {
          ref.title = MMELremovePackage(t[i++]);
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
    type: VarType.DATA,
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
          v.type = t[i++] as VarType;
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

export function parseView(id: string, data: string): MMELView {
  const v: MMELView = {
    id: id,
    name: '',
    profile: {},
    datatype: DataType.VIEW,
  };

  if (data !== '') {
    const t: string[] = MMELtokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const command: string = t[i++];
      if (i < t.length) {
        if (command === 'name') {
          v.name = MMELremovePackage(t[i++]);
        } else if (command === 'variables') {
          v.profile = parseSettings(t[i++]);
        } else {
          throw new Error(
            'Parsing error: view. ID ' + id + ': Unknown keyword ' + command
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

export function parseTerm(id: string, data: string): MMELTerm {
  const v: MMELTerm = {
    id,
    term: '',
    admitted: [],
    definition: '',
    notes: [],
    datatype: DataType.TERMS,
  };

  if (data !== '') {
    const t = MMELtokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const command: string = t[i++];
      if (i < t.length) {
        if (command === 'term') {
          v.term = MMELremovePackage(t[i++]);
        } else if (command === 'admitted') {
          v.admitted.push(MMELremovePackage(t[i++]));
        } else if (command === 'definition') {
          v.definition = MMELremovePackage(t[i++]);
        } else if (command === 'note') {
          v.notes.push(MMELremovePackage(t[i++]));
        } else {
          throw new Error(
            `Parsing error: term. ID ${id}: Unknown keyword ${command}`
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

export function parseNote(id: string, data: string): MMELNote {
  const v: MMELNote = {
    id: id,
    type: 'NOTE',
    message: '',
    ref: new Set<string>(),
    datatype: DataType.NOTE,
  };

  if (data !== '') {
    const t: string[] = MMELtokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const command: string = t[i++];
      if (i < t.length) {
        if (command === 'type') {
          v.type = t[i++] as NOTE_TYPE;
        } else if (command === 'message') {
          v.message = MMELremovePackage(t[i++]);
        } else if (command === 'reference') {
          v.ref = MMELtokenizeSet(t[i++]);
        } else {
          throw new Error(
            `Parsing error: note. ID ${id}: Unknown keyword ${command}`
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

function parseSettings(data: string): Record<string, MMELVarSetting> {
  const profile: Record<string, MMELVarSetting> = {};

  if (data !== '') {
    const t: string[] = MMELtokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const id = t[i++];
      if (i < t.length) {
        profile[id] = parseVarSetting(id, t[i++]);
      } else {
        throw new Error(
          'Parsing error: variable profile setting. ID ' +
            id +
            ': Expecting { after ' +
            id
        );
      }
    }
  }
  return profile;
}

function parseVarSetting(id: string, data: string): MMELVarSetting {
  const setting: MMELVarSetting = {
    id,
    isConst: true,
    value: '',
  };
  if (data !== '') {
    const t: string[] = MMELtokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const command: string = t[i++];
      if (i < t.length) {
        if (command === 'required') {
          setting.isConst = t[i++] === 'true';
        } else if (command === 'value') {
          setting.value = MMELremovePackage(t[i++]);
        } else {
          throw new Error(
            'Parsing error: variable setting. ID ' +
              id +
              ': Unknown keyword ' +
              command
          );
        }
      } else {
        throw new Error(
          'Parsing error: variable setting. ID ' +
            id +
            ': Expecting value for ' +
            command
        );
      }
    }
  }
  return setting;
}
