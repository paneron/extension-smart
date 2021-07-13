import { Reference } from '../support/reference';
import * as tokenizer from '../../util/tokenizer';
import { IDRegistry } from '../../util/IDRegistry';
import { Dataclass } from './dataclass';

export class DataAttribute {
  id = '';
  type = '';
  modality = '';
  cardinality = '';
  definition = '';
  ref: Array<Reference> = [];

  reftext: Array<string> = [];
  satisfy: Array<string> = [];

  isChecked = false;
  mother: Array<Dataclass> = [];

  constructor(basic: string, details: string) {
    let index = basic.indexOf('[');
    if (index != -1) {
      this.cardinality = basic
        .substr(index + 1, basic.length - index - 2)
        .trim();
      basic = basic.substr(0, index);
    }
    index = basic.indexOf(':');
    if (index != -1) {
      this.type = basic.substr(index + 1, basic.length - index - 1).trim();
      basic = basic.substr(0, index);
    }
    this.id = basic.trim();
    if (details != '') {
      const t: Array<string> = tokenizer.tokenizePackage(details);
      let i = 0;
      while (i < t.length) {
        const command: string = t[i++];
        if (i < t.length) {
          if (command == 'modality') {
            this.modality = t[i++];
          } else if (command == 'definition') {
            this.definition = tokenizer.removePackage(t[i++]);
          } else if (command == 'reference') {
            this.reftext = tokenizer.tokenizePackage(t[i++]);
          } else if (command == 'satisfy') {
            this.satisfy = tokenizer.tokenizePackage(t[i++]);
          } else {
            console.error(
              'Parsing error: data class attribute. ID ' +
                this.id +
                ': Unknown keyword ' +
                command
            );
          }
        } else {
          console.error(
            'Parsing error: data class attribute. ID ' +
              this.id +
              ': Expecting value for ' +
              command
          );
        }
      }
    }
  }

  resolve(idreg: IDRegistry): Dataclass | null {
    for (const x of this.reftext) {
      const y = idreg.getReference(x);
      if (y != null) {
        this.ref.push(y);
      } else {
        console.error(
          'Error in resolving IDs in reference for data attributes ' + this.id
        );
      }
    }
    let x = this.type;
    const i1 = x.indexOf('(');
    const i2 = x.indexOf(')');
    if (i1 != -1 && i2 != -1) {
      x = x.substr(i1 + 1, i2 - i1 - 1);
    }
    if (x != '') {
      const d = idreg.getDataclass(x);
      if (d != null) {
        return d;
      }
    }
    return null;
  }

  toModel(): string {
    let out: string = '  ' + this.id;
    if (this.type != '') {
      out += ': ' + this.type;
    }
    if (this.cardinality != '') {
      out += '[' + this.cardinality + ']';
    }
    out += ' {\n';
    out += '    definition "' + this.definition + '"\n';
    if (this.modality != '') {
      out += '    modality ' + this.modality + '\n';
    }
    if (this.satisfy.length > 0) {
      out += '    satisfy {\n';
      for (const s of this.satisfy) {
        out += '      ' + s + '\n';
      }
      out += '    }\n';
    }
    if (this.ref.length > 0) {
      out += '    reference {\n';
      for (const r of this.ref) {
        out += '      ' + r.id + '\n';
      }
      out += '    }\n';
    }
    out += '  }\n';
    return out;
  }
}
