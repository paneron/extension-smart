import { MMELNode } from '../serialize/interface/baseinterface';
import {
  MMELDataAttribute,
  MMELDataClass,
} from '../serialize/interface/datainterface';
import {
  MMELEdge,
  MMELEGate,
  MMELSubprocessComponent,
} from '../serialize/interface/flowcontrolinterface';
import {
  MMELApproval,
  MMELProcess,
} from '../serialize/interface/processinterface';
import { MMELProvision } from '../serialize/interface/supportinterface';

export class CheckListManager {
  edges = new Map<MMELEdge, CheckListEdgeAddon>();
  items = new Map<
    MMELProvision | MMELDataAttribute | MMELDataClass,
    CheckListItemAddon
  >();
  coms = new Map<MMELSubprocessComponent, CheckListComAddon>();
  gates = new Map<MMELEGate, CheckListGateAddon>();
  process = new Map<MMELProcess, CheckListProcessAddon>();
  apps = new Map<MMELApproval, CheckListApprovalAddon>();

  getEdgeAddOn(x: MMELEdge): CheckListEdgeAddon {
    const ret = this.edges.get(x);
    if (ret !== undefined) {
      return ret;
    }
    const record = new CheckListEdgeAddon();
    this.edges.set(x, record);
    return record;
  }

  getItemAddOn(
    x: MMELProvision | MMELDataAttribute | MMELDataClass
  ): CheckListItemAddon {
    const ret = this.items.get(x);
    if (ret !== undefined) {
      return ret;
    }
    const record = new CheckListItemAddon();
    this.items.set(x, record);
    return record;
  }

  getGateAddOn(x: MMELEGate): CheckListGateAddon {
    const ret = this.gates.get(x);
    if (ret !== undefined) {
      return ret;
    }
    const record = new CheckListGateAddon();
    this.gates.set(x, record);
    return record;
  }

  getComAddOn(x: MMELSubprocessComponent): CheckListComAddon {
    const ret = this.coms.get(x);
    if (ret !== undefined) {
      return ret;
    }
    const record = new CheckListComAddon();
    this.coms.set(x, record);
    return record;
  }

  getProcessAddOn(x: MMELProcess): CheckListProcessAddon {
    const ret = this.process.get(x);
    if (ret !== undefined) {
      return ret;
    }
    const record = new CheckListProcessAddon();
    this.process.set(x, record);
    return record;
  }

  getApprovalAddOn(x: MMELApproval): CheckListApprovalAddon {
    const ret = this.apps.get(x);
    if (ret !== undefined) {
      return ret;
    }
    const record = new CheckListApprovalAddon();
    this.apps.set(x, record);
    return record;
  }
}

export class CheckListComAddon {
  isDone = false;
}

export class CheckListEdgeAddon {
  isDone = false;
}

export class CheckListItemAddon {
  isChecked = false;
  progress = 0;
  mother: Array<MMELDataClass> = [];
}

export class CheckListProcessAddon {
  progress = 0;
  job: Array<MMELNode | MMELProvision> | null = null;
  percentage = 0;
  isChecked = false;
}

export class CheckListGateAddon {
  required: boolean | null = null;
  met: boolean | null = null;
}

export class CheckListApprovalAddon {
  isChecked = false;
  progress = 0;
}
