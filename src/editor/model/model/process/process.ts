import * as tokenizer from '../../util/tokenizer';
import { GraphNode } from '../graphnode';
import { Role } from '../support/role';
import { Registry } from '../data/registry';
import { Provision } from '../support/provision';
import { IDRegistry } from '../../util/IDRegistry';
import { FilterType } from '../../../ui/util/filtermanager';
import { Subprocess } from '../flow/subprocess';

export class Process extends GraphNode {
  name = '';
  modality = '';
  actor: Role | null = null;
  output: Array<Registry> = [];
  input: Array<Registry> = [];
  provision: Array<Provision> = [];
  page: Subprocess | null = null;
  measure: Array<string> = [];

  actortext = '';
  pagetext = '';
  outputtext: Array<string> = [];
  provisiontext: Array<string> = [];
  inputtext: Array<string> = [];

  filterMatch: FilterType = FilterType.NOT_MATCH;
  isChecked = false;

  progress = 0;
  job: Array<GraphNode | Provision> | null = null;
  percentage = 0;

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
          } else if (command == 'subprocess') {
            this.pagetext = t[i++];
          } else if (command == 'validate_provision') {
            this.provisiontext = tokenizer.tokenizePackage(t[i++]);
          } else if (command == 'validate_measurement') {
            this.measure = tokenizer
              .tokenizePackage(t[i++])
              .flatMap(x => tokenizer.removePackage(x));
          } else if (command == 'output') {
            this.outputtext = tokenizer.tokenizePackage(t[i++]);
          } else if (command == 'reference_data_registry') {
            this.inputtext = tokenizer.tokenizePackage(t[i++]);
          } else {
            console.error(
              'Parsing error: process. ID ' +
                id +
                ': Unknown keyword ' +
                command
            );
          }
        } else {
          console.error(
            'Parsing error: process. ID ' +
              id +
              ': Expecting value for ' +
              command
          );
        }
      }
    }
  }

  resolve(idreg: IDRegistry): void {
    for (const x of this.outputtext) {
      const y = idreg.getObject(x);
      if (y instanceof Registry) {
        this.output.push(y);
        y.data?.motherprocess.add(this);
      } else {
        console.error(
          'Error in resolving IDs in output for process ' + this.id
        );
      }
    }
    for (const x of this.inputtext) {
      const y = idreg.getObject(x);
      if (y instanceof Registry) {
        this.input.push(y);
        y.data?.motherprocess.add(this);
      } else {
        console.error('Error in resolving IDs in input for process ' + this.id);
      }
    }
    for (const x of this.provisiontext) {
      const y = idreg.getProvision(x);
      if (y != null) {
        this.provision.push(y);
        y.mother.push(this);
      } else {
        console.error(
          'Error in resolving IDs in provision for process ' + this.id
        );
      }
    }
    if (this.actortext != '') {
      const y = idreg.getObject(this.actortext);
      if (y instanceof Role) {
        this.actor = <Role>y;
      } else {
        console.error('Error in resolving IDs in actor for process ' + this.id);
      }
    }
    if (this.pagetext != '') {
      const a = idreg.pageids.get(this.pagetext);
      if (a instanceof Subprocess) {
        this.page = a;
      } else {
        console.error(
          'Error in resolving IDs in subprocess for process ' + this.id
        );
      }
    }
  }

  toModel(): string {
    let out: string = 'process ' + this.id + ' {\n';
    out += '  name "' + this.name + '"\n';
    if (this.actor != null) {
      out += '  actor ' + this.actor.id + '\n';
    }
    if (this.modality != '') {
      out += '  modality ' + this.modality + '\n';
    }
    if (this.input.length > 0) {
      out += '  reference_data_registry {\n';
      for (const dr of this.input) {
        out += '    ' + dr.id + '\n';
      }
      out += '  }\n';
    }
    if (this.provision.length > 0) {
      out += '  validate_provision {\n';
      for (const r of this.provision) {
        out += '    ' + r.id + '\n';
      }
      out += '  }\n';
    }
    if (this.measure.length > 0) {
      out += '  validate_measurement {\n';
      for (const v of this.measure) {
        out += '    "' + v + '"\n';
      }
      out += '  }\n';
    }
    if (this.output.length > 0) {
      out += '  output {\n';
      for (const c of this.output) {
        out += '    ' + c.id + '\n';
      }
      out += '  }\n';
    }
    if (this.page != null) {
      out += '  subprocess ' + this.page.id + '\n';
    }
    out += '}\n';
    return out;
  }
}
