import { DataType } from '../interface/baseinterface';
import { MMELApproval, MMELProcess } from '../interface/processinterface';
import {
  MMELremovePackage,
  MMELtokenizePackage,
  MMELtokenizeSet,
} from '../util/tokenizer';

export function parseApproval(id: string, data: string): MMELApproval {
  const app: MMELApproval = {
    id       : id,
    datatype : DataType.APPROVAL,
    name     : '',
    modality : '',
    actor    : '',
    approver : '',
    records  : new Set<string>(),
    ref      : new Set<string>(),
  };

  if (data !== '') {
    const t: string[] = MMELtokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const command: string = t[i++];
      if (i < t.length) {
        if (command === 'modality') {
          app.modality = t[i++];
        } else if (command === 'name') {
          app.name = MMELremovePackage(t[i++]);
        } else if (command === 'actor') {
          app.actor = t[i++];
        } else if (command === 'approve_by') {
          app.approver = t[i++];
        } else if (command === 'approval_record') {
          app.records = MMELtokenizeSet(t[i++]);
        } else if (command === 'reference') {
          app.ref = MMELtokenizeSet(t[i++]);
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
  return app;
}

export function parseProcess(id: string, data: string): MMELProcess {
  const p: MMELProcess = {
    id        : id,
    datatype  : DataType.PROCESS,
    name      : '',
    modality  : '',
    actor     : '',
    output    : new Set<string>(),
    input     : new Set<string>(),
    notes     : new Set<string>(),
    provision : new Set<string>(),
    links     : new Set<string>(),
    tables    : new Set<string>(),
    figures   : new Set<string>(),
    comments  : new Set<string>(),
    page      : '',
    measure   : [],
  };

  if (data !== '') {
    const t: string[] = MMELtokenizePackage(data);
    let i = 0;
    while (i < t.length) {
      const command: string = t[i++];
      if (i < t.length) {
        if (command === 'modality') {
          p.modality = t[i++];
        } else if (command === 'name') {
          p.name = MMELremovePackage(t[i++]);
        } else if (command === 'actor') {
          p.actor = t[i++];
        } else if (command === 'subprocess') {
          p.page = t[i++];
        } else if (command === 'validate_provision') {
          p.provision = MMELtokenizeSet(t[i++]);
        } else if (command === 'links') {
          p.links = MMELtokenizeSet(t[i++]);
        } else if (command === 'validate_measurement') {
          p.measure = MMELtokenizePackage(t[i++]).flatMap(x =>
            MMELremovePackage(x)
          );
        } else if (command === 'output') {
          p.output = MMELtokenizeSet(t[i++]);
        } else if (command === 'table') {
          p.tables = MMELtokenizeSet(t[i++]);
        } else if (command === 'figure') {
          p.figures = MMELtokenizeSet(t[i++]);
        } else if (command === 'note') {
          p.notes = MMELtokenizeSet(t[i++]);
        } else if (command === 'comment') {
          p.comments = MMELtokenizeSet(t[i++]);
        } else if (command === 'reference_data_registry') {
          p.input = MMELtokenizeSet(t[i++]);
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
  return p;
}
