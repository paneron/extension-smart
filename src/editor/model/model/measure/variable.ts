import * as tokenizer from '../../util/tokenizer';

export class VarType {
  static DATA = 'DATAITEM';
  static LISTDATA = 'DATALIST';
  static DERIVED = 'DERIVED';
}

export const VAR_TYPES = [VarType.DATA, VarType.LISTDATA, VarType.DERIVED];

export class Variable {
  id: string;
  type: string = VarType.DATA;
  definition = '';
  description = '';

  constructor(id: string, data: string) {
    this.id = id;
    if (data != '') {
      const t: Array<string> = tokenizer.tokenizePackage(data);
      let i = 0;
      while (i < t.length) {
        const command: string = t[i++];
        if (i < t.length) {
          if (command == 'type') {
            this.type = t[i++];
          } else if (command == 'definition') {
            this.definition = tokenizer.removePackage(t[i++]);
          } else if (command == 'description') {
            this.description = tokenizer.removePackage(t[i++]);
          } else {
            console.error(
              'Parsing error: variable. ID ' +
                id +
                ': Unknown keyword ' +
                command
            );
          }
        } else {
          console.error(
            'Parsing error: variable. ID ' +
              id +
              ': Expecting value for ' +
              command
          );
        }
      }
    }
  }

  toModel(): string {
    let out: string = 'measurement ' + this.id + ' {\n';
    if (this.type != '') {
      out += '  type ' + this.type + '\n';
    }
    if (this.definition != '') {
      out += '  definition "' + this.definition + '"\n';
    }
    if (this.description != '') {
      out += '  description "' + this.description + '"\n';
    }
    out += '}\n';
    return out;
  }
}
