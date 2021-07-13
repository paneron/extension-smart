import * as tokenizer from '../../util/tokenizer';
import { GraphNode } from '../graphnode';
import { Role } from '../support/role';
import { Registry } from '../data/registry';
import { Reference } from '../support/reference';
import { IDRegistry } from '../../util/IDRegistry';
import { FilterType } from '../../../ui/util/filtermanager';

export class Approval extends GraphNode {
  name = '';
  modality = '';
  actor: Role | null = null;
  approver: Role | null = null;
  records: Array<Registry> = [];
  ref: Array<Reference> = [];

  actortext = '';
  approvertext = '';
  recordtext: Array<string> = [];
  reftext: Array<string> = [];

  isChecked = false;

  filterMatch: FilterType = FilterType.NOT_MATCH;

  constructor(id: string, data: string) {
    super(id);
    if (data != '') {
      const t: Array<string> = tokenizer.tokenizePackage(data);
      let i = 0;
      while (i < t.length) {
        const command: string = t[i++];
        if (i < t.length) {
          if (command == 'modality') {
            this.modality = t[i++];
          } else if (command == 'name') {
            this.name = tokenizer.removePackage(t[i++]);
          } else if (command == 'actor') {
            this.actortext = t[i++];
          } else if (command == 'approve_by') {
            this.approvertext = t[i++];
          } else if (command == 'approval_record') {
            this.recordtext = tokenizer.tokenizePackage(t[i++]);
          } else if (command == 'reference') {
            this.reftext = tokenizer.tokenizePackage(t[i++]);
          } else {
            console.error(
              'Parsing error: approval. ID ' +
                id +
                ': Unknown keyword ' +
                command
            );
          }
        } else {
          console.error(
            'Parsing error: approval. ID ' +
              id +
              ': Expecting value for ' +
              command
          );
        }
      }
    }
  }

  resolve(idreg: IDRegistry): void {
    if (this.actortext != '') {
      const y = idreg.getObject(this.actortext);
      if (y instanceof Role) {
        this.actor = <Role>y;
      } else {
        console.error('Error in resolving IDs in actor for process ' + this.id);
      }
    }
    if (this.approvertext != '') {
      const y = idreg.getObject(this.approvertext);
      if (y instanceof Role) {
        this.approver = <Role>y;
      } else {
        console.error(
          'Error in resolving IDs in approver for process ' + this.id
        );
      }
    }
    for (const x of this.recordtext) {
      const y = idreg.getObject(x);
      if (y instanceof Registry) {
        this.records.push(y);
      } else {
        console.error(
          'Error in resolving IDs in approval record for process ' + this.id
        );
      }
    }
    for (const x of this.reftext) {
      const y = idreg.getReference(x);
      if (y != null) {
        this.ref.push(y);
      } else {
        console.error('Error in resolving IDs in input for process ' + this.id);
      }
    }
  }

  toModel(): string {
    let out: string = 'approval ' + this.id + ' {\n';
    out += '  name "' + this.name + '"\n';
    if (this.actor != null) {
      out += '  actor ' + this.actor.id + '\n';
    }
    out += '  modality ' + this.modality + '\n';
    if (this.approver != null) {
      out += '  approve_by ' + this.approver.id + '\n';
    }
    if (this.records.length > 0) {
      out += '  approval_record {\n';
      for (const dr of this.records) {
        out += '    ' + dr.id + '\n';
      }
      out += '  }\n';
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
