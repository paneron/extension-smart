import { IDRegistry } from '../../util/IDRegistry';
import * as tokenizer from '../../util/tokenizer';
import { GraphNode } from '../graphnode';
import { Process } from '../process/process';
import { Reference } from './reference';

export class Provision {
  subject = new Map<string, string>();
  id = '';
  modality = '';
  condition = '';
  ref: Array<Reference> = [];
  reftext: Array<string> = [];

  isChecked = false;
  mother: Array<Process> = [];

  progress = 0;

  parent: Array<GraphNode> = [];

  constructor(id: string, data: string) {
    this.id = id;
    if (data != '') {
      const t: Array<string> = tokenizer.tokenizePackage(data);
      let i = 0;
      while (i < t.length) {
        const command: string = t[i++];
        if (i < t.length) {
          if (command == 'modality') {
            this.modality = t[i++];
          } else if (command == 'condition') {
            this.condition = tokenizer.removePackage(t[i++]);
          } else if (command == 'reference') {
            this.reftext = tokenizer.tokenizePackage(t[i++]);
          } else {
            this.subject.set(command, t[i++]);
          }
        } else {
          console.error(
            'Parsing error: provision. ID ' +
              id +
              ': Expecting value for ' +
              command
          );
        }
      }
    }
  }

  resolve(idreg: IDRegistry): void {
    for (const x of this.reftext) {
      const y = idreg.getReference(x);
      if (y != null) {
        this.ref.push(y);
      }
    }
  }

  toModel(): string {
    let out: string = 'provision ' + this.id + ' {\n';
    this.subject.forEach((value: string, key: string) => {
      out += '  ' + key + ' ' + value + '\n';
    });
    out += '  condition "' + this.condition + '"\n';
    if (this.modality != '') {
      out += '  modality ' + this.modality + '\n';
    }
    if (this.ref.length > 0) {
      out += '  reference {\n';
      for (const r of this.ref) {
        out += '    ' + r.id + '\n';
      }
      out += '  }\n';
    }
    out += '}\n';
    return out;
  }
}
