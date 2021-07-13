import { DataAttribute } from './dataattribute';
import * as tokenizer from '../../util/tokenizer';
import { IDRegistry } from '../../util/IDRegistry';
import { GraphNode } from '../graphnode';
import { Registry } from './registry';
import { Process } from '../process/process';
import { FilterType } from '../../../ui/util/filtermanager';

export class Dataclass extends GraphNode {
  attributes: Array<DataAttribute> = [];

  rdcs: Set<Dataclass> = new Set<Dataclass>();
  motherref: Set<Dataclass> = new Set<Dataclass>();
  motherprocess: Set<Process> = new Set<Process>();
  mother: Registry | null = null;

  isChecked = false;
  filterMatch: number = FilterType.NOT_MATCH;

  constructor(id: string, data: string) {
    super(id);
    if (data != '') {
      const t: Array<string> = tokenizer.tokenizeAttributes(data);
      let i = 0;
      while (i < t.length) {
        const basic: string = t[i++];
        if (i < t.length) {
          const details: string = t[i++];
          this.attributes.push(new DataAttribute(basic.trim(), details));
        } else {
          console.error(
            'Parsing error: class. ID ' + id + ': Expecting { after ' + basic
          );
        }
      }
    }
  }

  resolve(idreg: IDRegistry): void {
    for (const x of this.attributes) {
      const d = x.resolve(idreg);
      x.mother.push(this);
      if (d != null) {
        if (!this.rdcs.has(d)) {
          this.rdcs.add(d);
          d.motherref.add(this);
        }
      }
    }
  }

  toModel(): string {
    let out: string = 'class ' + this.id + ' {\n';
    for (const a of this.attributes) {
      out += a.toModel();
    }
    out += '}\n';
    return out;
  }
}
