import {
  parseComment,
  parseFigure,
  parseLink,
  parseMetaData,
  parseNote,
  parseProvision,
  parseReference,
  parseRole,
  parseSection,
  parseTable,
  parseTerm,
  parseVariable,
  parseView,
} from './handler/supporthandler';
import { MMELModel } from '@/interface/model';
import { MMELremovePackage, MMELtokenize } from '@/util/tokenizer';
import { parseApproval, parseProcess } from '@/handler/processhandler';
import {
  parseDataClass,
  parseEnum,
  parseRegistry,
} from './handler/datahandler';
import {
  parseEndEvent,
  parseSignalCatchEvent,
  parseStartEvent,
  parseTimerEvent,
} from './handler/eventhandler';
import { parseEGate, parseSubprocess } from '@/handler/flowcontrolhandler';
import {
  toCommentModel,
  toEnumModel,
  toFigModel,
  toLinkModel,
  toMetaDataModel,
  toNodeModel,
  toNoteModel,
  toProvisionModel,
  toReferenceModel,
  toRoleModel,
  toSectionModel,
  toSubprocessModel,
  toTableModel,
  toTermsModel,
  toVariableModel,
  toViewProfile as toViewProfileModel,
} from './util/serailizeformater';
import { validateModel } from '@/util/validation';

/**
 * the function to convert text to MMEL
 */
export function textToMMEL(x: string): MMELModel {
  const pm = parseModel(x);
  validateModel(pm);
  return pm;
}

/**
 * the function to convert MMEL to text
 */
export function MMELToText(model: MMELModel, modelVersion: string = 'undefined'): string {
  let out = '';
  if (model.root !== '') {
    out += 'root ' + model.root + '\n\n';
  }
  out += 'version "' + modelVersion + '"\n\n';
  out += toMetaDataModel(model.meta) + '\n';
  for (const r in model.roles) {
    out += toRoleModel(model.roles[r]) + '\n';
  }
  for (const e in model.elements) {
    out += toNodeModel(model.elements[e]) + '\n';
  }
  for (const r in model.provisions) {
    out += toProvisionModel(model.provisions[r]) + '\n';
  }
  for (const e in model.enums) {
    out += toEnumModel(model.enums[e]) + '\n';
  }
  for (const p in model.pages) {
    out += toSubprocessModel(model.pages[p]) + '\n';
  }
  for (const v in model.vars) {
    out += toVariableModel(model.vars[v]) + '\n';
  }
  for (const v in model.notes) {
    out += toNoteModel(model.notes[v]) + '\n';
  }
  for (const v in model.views) {
    out += toViewProfileModel(model.views[v]) + '\n';
  }
  for (const r in model.refs) {
    out += toReferenceModel(model.refs[r]) + '\n';
  }
  for (const t in model.terms) {
    out += toTermsModel(model.terms[t]) + '\n';
  }
  for (const t in model.tables) {
    out += toTableModel(model.tables[t]) + '\n';
  }
  for (const t in model.figures) {
    out += toFigModel(model.figures[t]) + '\n';
  }
  for (const t in model.sections) {
    out += toSectionModel(model.sections[t]) + '\n';
  }
  for (const t in model.links) {
    out += toLinkModel(model.links[t]) + '\n';
  }
  for (const t in model.comments) {
    out += toCommentModel(model.comments[t]) + '\n';
  }
  return out;
}

function parseModel(input: string): MMELModel {
  const model: MMELModel = {
    meta       : parseMetaData(''),
    roles      : {},
    provisions : {},
    pages      : {},
    elements   : {},
    refs       : {},
    enums      : {},
    vars       : {},
    notes      : {},
    views      : {},
    terms      : {},
    tables     : {},
    figures    : {},
    sections   : {},
    links      : {},
    comments   : {},
    root       : '',
    version    : '',
  };

  const token: string[] = MMELtokenize(input);
  let i = 0;
  while (i < token.length) {
    const command: string = token[i++];
    if (command === 'root') {
      model.root = token[i++].trim();
    } else if (command === 'metadata') {
      model.meta = parseMetaData(token[i++]);
    } else if (command === 'role') {
      const r = parseRole(token[i++], token[i++]);
      model.roles[r.id] = r;
    } else if (command === 'provision') {
      const p = parseProvision(token[i++], token[i++]);
      model.provisions[p.id] = p;
    } else if (command === 'process') {
      const p = parseProcess(token[i++], token[i++]);
      model.elements[p.id] = p;
    } else if (command === 'class') {
      const p = parseDataClass(token[i++], token[i++]);
      model.elements[p.id] = p;
    } else if (command === 'data_registry') {
      const p = parseRegistry(token[i++], token[i++]);
      model.elements[p.id] = p;
    } else if (command === 'start_event') {
      const p = parseStartEvent(token[i++], token[i++]);
      model.elements[p.id] = p;
    } else if (command === 'end_event') {
      const p = parseEndEvent(token[i++], token[i++]);
      model.elements[p.id] = p;
    } else if (command === 'timer_event') {
      const p = parseTimerEvent(token[i++], token[i++]);
      model.elements[p.id] = p;
    } else if (command === 'exclusive_gateway') {
      const p = parseEGate(token[i++], token[i++]);
      model.elements[p.id] = p;
    } else if (command === 'subprocess') {
      const p = parseSubprocess(token[i++], token[i++]);
      model.pages[p.id] = p;
    } else if (command === 'reference') {
      const p = parseReference(token[i++], token[i++]);
      model.refs[p.id] = p;
    } else if (command === 'approval') {
      const p = parseApproval(token[i++], token[i++]);
      model.elements[p.id] = p;
    } else if (command === 'enum') {
      const p = parseEnum(token[i++], token[i++]);
      model.enums[p.id] = p;
    } else if (command === 'measurement') {
      const v = parseVariable(token[i++], token[i++]);
      model.vars[v.id] = v;
    } else if (command === 'view') {
      const v = parseView(token[i++], token[i++]);
      model.views[v.id] = v;
    } else if (command === 'note') {
      const v = parseNote(token[i++], token[i++]);
      model.notes[v.id] = v;
    } else if (command === 'signal_catch_event') {
      const e = parseSignalCatchEvent(token[i++], token[i++]);
      model.elements[e.id] = e;
    } else if (command === 'term') {
      const e = parseTerm(token[i++], token[i++]);
      model.terms[e.id] = e;
    } else if (command === 'table') {
      const t = parseTable(token[i++], token[i++]);
      model.tables[t.id] = t;
    } else if (command === 'figure') {
      const t = parseFigure(token[i++], token[i++]);
      model.figures[t.id] = t;
    } else if (command === 'section') {
      const t = parseSection(token[i++], token[i++]);
      model.sections[t.id] = t;
    } else if (command === 'link') {
      const t = parseLink(token[i++], token[i++]);
      model.links[t.id] = t;
    } else if (command === 'comment') {
      const c = parseComment(token[i++], token[i++]);
      model.comments[c.id] = c;
    } else if (command === 'version') {
      model.version = MMELremovePackage(token[i++]);
    } else {
      throw Error('Unknown command ' + command);
    }
  }
  return model;
}
