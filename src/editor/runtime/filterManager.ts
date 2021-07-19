import { MMELDataClass } from '../serialize/interface/datainterface';
import {
  MMELApproval,
  MMELProcess,
} from '../serialize/interface/processinterface';
import { MMELReference } from '../serialize/interface/supportinterface';
import { FilterType } from '../ui/util/filtermanager';

export class FilterManager {
  documents: Map<string, number> = new Map<string, number>();
  clauses: Array<Set<string>> = [];
  map = new Map<MMELProcess | MMELApproval | MMELDataClass, FilterAddon>();

  get(x: MMELProcess | MMELApproval | MMELDataClass): FilterAddon {
    const ret = this.map.get(x);
    if (ret !== undefined) {
      return ret;
    }
    const record = new FilterAddon();
    this.map.set(x, record);
    return record;
  }

  readDocu(refs: Array<MMELReference>) {
    this.documents.clear();
    this.clauses = [];
    for (const r of refs) {
      if (!this.documents.has(r.document)) {
        this.documents.set(r.document, this.documents.size);
        this.clauses.push(new Set<string>());
      }
      const x = this.documents.get(r.document);
      if (x !== undefined) {
        if (!this.clauses[x].has(r.clause)) {
          this.clauses[x].add(r.clause);
        }
      }
    }
  }
}

export class FilterAddon {
  filterMatch: FilterType = FilterType.UNKNOWN;
}
