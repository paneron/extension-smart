import { DataType } from '../interface/baseinterface';
import { MMELRegistry } from '../interface/datainterface';
import { MMELSubprocess } from '../interface/flowcontrolinterface';
import {
  MMELApproval,
  MMELProcess,
  ParsingApproval,
  ParsingProcess,
} from '../interface/processinterface';
import {
  MMELProvision,
  MMELReference,
  MMELRole,
} from '../interface/supportinterface';
import { MMELremovePackage, MMELtokenizePackage } from '../util/tokenizer';

export function parseApproval(id: string, data: string): ParsingApproval {
  const app: MMELApproval = {
    id: id,
    datatype: DataType.APPROVAL,
    name: '',
    modality: '',
    actor: null,
    approver: null,
    records: [],
    ref: [],
  };
  const container: ParsingApproval = {
    content: app,
    p_actor: '',
    p_approver: '',
    p_records: [],
    p_ref: [],
  };

  if (data !== '') {
    const t: Array<string> = MMELtokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const command: string = t[i++];
      if (i < t.length) {
        if (command === 'modality') {
          app.modality = t[i++];
        } else if (command === 'name') {
          app.name = MMELremovePackage(t[i++]);
        } else if (command === 'actor') {
          container.p_actor = t[i++];
        } else if (command === 'approve_by') {
          container.p_approver = t[i++];
        } else if (command === 'approval_record') {
          container.p_records = MMELtokenizePackage(t[i++]);
        } else if (command === 'reference') {
          container.p_ref = MMELtokenizePackage(t[i++]);
        } else {
          throw new Error(
            'Parsing error: approval. ID ' + id + ': Unknown keyword ' + command
          );
        }
      } else {
        throw new Error(
          'Parsing error: approval. ID ' +
            id +
            ': Expecting value for ' +
            command
        );
      }
    }
  }
  return container;
}

export function resolveApproval(
  container: ParsingApproval,
  roles: Map<string, MMELRole>,
  refs: Map<string, MMELReference>,
  records: Map<string, MMELRegistry>
): MMELApproval {
  const app = container.content;
  if (container.p_actor !== '') {
    const y = roles.get(container.p_actor);
    if (y !== undefined) {
      app.actor = y;
    } else {
      throw new Error('Error in resolving IDs in actor for process ' + app.id);
    }
  }
  if (container.p_approver !== '') {
    const y = roles.get(container.p_approver);
    if (y !== undefined) {
      app.approver = y;
    } else {
      throw new Error(
        'Error in resolving IDs in approver for process ' + app.id
      );
    }
  }
  for (const x of container.p_records) {
    const y = records.get(x);
    if (y !== undefined) {
      app.records.push(y);
    } else {
      throw new Error(
        'Error in resolving IDs in approval record for process ' + app.id
      );
    }
  }
  for (const x of container.p_ref) {
    const y = refs.get(x);
    if (y !== undefined) {
      app.ref.push(y);
    } else {
      throw new Error('Error in resolving IDs in input for process ' + app.id);
    }
  }
  return app;
}

export function parseProcess(id: string, data: string): ParsingProcess {
  const p: MMELProcess = {
    id: id,
    datatype: DataType.PROCESS,
    name: '',
    modality: '',
    actor: null,
    output: [],
    input: [],
    provision: [],
    page: null,
    measure: [],
  };
  const container: ParsingProcess = {
    content: p,
    p_actor: '',
    p_page: '',
    p_input: [],
    p_output: [],
    p_provision: [],
  };

  if (data !== '') {
    const t: Array<string> = MMELtokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const command: string = t[i++];
      if (i < t.length) {
        if (command === 'modality') {
          p.modality = t[i++];
        } else if (command === 'name') {
          p.name = MMELremovePackage(t[i++]);
        } else if (command === 'actor') {
          container.p_actor = t[i++];
        } else if (command === 'subprocess') {
          container.p_page = t[i++];
        } else if (command === 'validate_provision') {
          container.p_provision = MMELtokenizePackage(t[i++]);
        } else if (command === 'validate_measurement') {
          p.measure = MMELtokenizePackage(t[i++]).flatMap(x =>
            MMELremovePackage(x)
          );
        } else if (command === 'output') {
          container.p_output = MMELtokenizePackage(t[i++]);
        } else if (command === 'reference_data_registry') {
          container.p_input = MMELtokenizePackage(t[i++]);
        } else {
          throw new Error(
            'Parsing error: process. ID ' + id + ': Unknown keyword ' + command
          );
        }
      } else {
        throw new Error(
          'Parsing error: process. ID ' +
            id +
            ': Expecting value for ' +
            command
        );
      }
    }
  }
  return container;
}

export function resolveProcess(
  container: ParsingProcess,
  regs: Map<string, MMELRegistry>,
  provisions: Map<string, MMELProvision>,
  roles: Map<string, MMELRole>,
  pages: Map<string, MMELSubprocess>
): MMELProcess {
  const p = container.content;
  for (const x of container.p_output) {
    const y = regs.get(x);
    if (y !== undefined) {
      p.output.push(y);
    } else {
      throw new Error('Error in resolving IDs in output for process ' + p.id);
    }
  }
  for (const x of container.p_input) {
    const y = regs.get(x);
    if (y !== undefined) {
      p.input.push(y);
    } else {
      throw new Error('Error in resolving IDs in input for process ' + p.id);
    }
  }
  for (const x of container.p_provision) {
    const y = provisions.get(x);
    if (y !== undefined) {
      p.provision.push(y);
    } else {
      throw new Error(
        'Error in resolving IDs in provision for process ' + p.id
      );
    }
  }
  if (container.p_actor !== '') {
    const y = roles.get(container.p_actor);
    if (y !== undefined) {
      p.actor = y;
    } else {
      throw new Error('Error in resolving IDs in actor for process ' + p.id);
    }
  }
  if (container.p_page !== '') {
    const a = pages.get(container.p_page);
    if (a !== undefined) {
      p.page = a;
    } else {
      throw new Error(
        'Error in resolving IDs in subprocess for process ' + p.id
      );
    }
  }
  return p;
}
