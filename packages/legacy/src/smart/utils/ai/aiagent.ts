import { MMELDocument } from '@/smart/model/document';
import {
  EditorModel,
  EditorProcess,
  EditorSubprocess,
  isEditorProcess,
} from '../../model/editormodel';
import {
  createEditorModelWrapper,
  ModelWrapper,
} from '../../model/modelwrapper';
import { DataType } from '@paneron/libmmel/interface/baseinterface';
import {
  MMELLink,
  MMELNote,
  MMELTextSection,
} from '@paneron/libmmel/interface/supportinterface';
import { detectModality } from '@/smart/ui/edit/components/ProvisionList';
import {
  createEdge,
  createNewEditorModel,
  createNote,
  createProcess,
  createProvision,
  createReference,
  createRole,
  createSubprocessComponent,
  createTerm,
} from '../EditorFactory';
import { createNewPage } from '@/smart/utils/ModelAddComponentHandler';
import * as Logger from '@/lib/logger';

type Sections = Record<string, Section>;
type NoteType = MMELNote['type'];
interface RoleItem {
  id: string;
  title: string;
  count: number;
}

interface Section {
  cnumber: number;
  clause: string;
  secs: Sections;
  data: string[];
}

function processDoc(doc: MMELDocument): Sections {
  const result: Sections = {};
  const initSec: Section = {
    cnumber : NaN,
    clause  : '',
    secs    : result,
    data    : [],
  };
  for (const s of Object.values(doc.states)) {
    const parts = s.clause.split('.');
    let sec = initSec;
    let clause = '';
    for (const p of parts) {
      const x = p.trim();
      if (x !== '') {
        if (clause === '') {
          clause = x;
        } else {
          clause = `${clause}.${x}`;
        }
      }
      if (sec.secs[x] === undefined) {
        sec.secs[x] = {
          cnumber : parseInt(x),
          clause,
          secs    : {},
          data    : [],
        };
      }
      sec = sec.secs[x];
    }
    sec.data.push(s.text);
  }
  return result;
}

export async function aiTranslate(doc: MMELDocument): Promise<ModelWrapper> {
  const model = createNewEditorModel();
  const meta = model.meta;
  meta.shortname = doc.id;
  meta.title = doc.title;
  meta.author = doc.sdo && doc.sdo !== '' ? doc.sdo : 'Auto Translation';
  meta.edition =
    doc.edition && doc.edition !== '' ? doc.edition : new Date().toString();
  meta.schema = 'SMART';
  const secs = processDoc(doc);
  const filtered = Object.values(secs)
    .filter(x => !isNaN(x.cnumber))
    .sort((x, y) => x.cnumber - y.cnumber);
  let termsSeen = false;
  try {
    for (const sec of filtered) {
      const title = sec.data.length > 0 ? sec.data[0] : '';
      const lower = title.toLowerCase();
      if (lower.includes('term') && lower.includes('definition')) {
        termsSeen = true;
        readTerms(sec, model);
      } else {
        if (termsSeen) {
          readDetails(sec, model, model.pages[model.root]);
        } else {
          readSections(sec, model);
        }
      }
    }
    const mw = createEditorModelWrapper(model);
    return mw;
  } catch (e: unknown) {
    if (typeof e === 'object') {
      const error = e as Error;
      Logger.log(error.message);
      Logger.log(error.stack);
    }
    throw e;
  }
}

function readSections(sec: Section, model: EditorModel) {
  const text = sec.data.slice(1).join('\n');
  const section: MMELTextSection = {
    id       : `section${sec.clause}`,
    title    : sec.data.length > 0 ? sec.data[0] : sec.clause,
    content  : text,
    datatype : DataType.SECTION,
  };
  model.sections[section.id] = section;
  for (const s of Object.values(sec.secs)) {
    readSections(s, model);
  }
}

function readTerms(sec: Section, model: EditorModel) {
  for (const s of Object.values(sec.secs)) {
    readTerm(s, model);
  }
}

function readTerm(sec: Section, model: EditorModel) {
  const title = sec.data.length > 0 ? sec.data[0] : '';
  if (title !== '') {
    const texts = sec.data.slice(1);
    let definition = '';
    const notes: string[] = [];
    let noteMode = false;
    for (const t of texts) {
      if (t.trim().substring(0, 4).toLowerCase() === 'note') {
        noteMode = true;
        notes.push(t);
      } else {
        if (noteMode) {
          notes[notes.length - 1] += '\n' + t;
        } else {
          if (definition === '') {
            definition = t;
          } else {
            definition += '\n' + t;
          }
        }
      }
    }
    const term = createTerm(`term${sec.cnumber}`);
    term.term = title;
    term.definition = definition;
    term.notes = notes;
    model.terms[term.id] = term;
  }
}

function findLastPunctation(x: string): number {
  const chars = [...x];
  const targets = ['.', ',', '(', ')', ';'];
  for (let i = x.length - 1; i >= 0; i--) {
    if (targets.includes(chars[i])) {
      return i;
    }
  }
  return -1;
}

function readDetails(sec: Section, model: EditorModel, page: EditorSubprocess) {
  const title = sec.data.length > 0 ? sec.data[0] : `Process ${sec.clause}`;
  const refid = `ref${sec.clause}`.replaceAll('.', '-');
  const ref = createReference(refid);
  ref.document = model.meta.title;
  ref.clause = sec.clause;
  ref.title = title;

  const processId = `Clause${sec.clause}Process`;
  const process: EditorProcess = createProcess(processId);
  process.name = title;

  const component = createSubprocessComponent(processId);
  component.y = 80;
  component.x = (Object.values(page.childs).length - 1) * 150 - 70;
  const edge = createEdge(`${page.start}To${processId}`);
  edge.from = page.start;
  edge.to = processId;

  page.childs[processId] = component;
  page.edges[edge.id] = edge;
  model.elements[processId] = process;
  model.refs[refid] = ref;

  const sents = sec.data.slice(1);

  let plen = Object.keys(model.provisions).length;

  let lastNote: MMELNote | undefined = undefined;
  let role: RoleItem | undefined = undefined;
  const roles: Record<string, RoleItem> = {};
  for (const sent of sents) {
    const pos = sent.search(/\s/);
    const first = (pos !== -1 ? sent.substring(0, pos) : sent).toLowerCase();
    let type: NoteType | undefined = undefined;
    if (first.length <= 5 && first.includes('note')) {
      type = 'NOTE';
    } else if (first === 'example') {
      type = 'EXAMPLE';
    } else if (first === 'commentary') {
      type = 'COMMENTARY';
    } else if (first === 'definition') {
      type = 'DEFINITION';
    }
    if (type) {
      const nlen = Object.keys(model.notes).length;
      const note = createNote(`Note${nlen}`);
      note.type = type;
      note.message = sent;
      note.ref.add(refid);
      model.notes[note.id] = note;
      process.notes.add(note.id);
      lastNote = note;
    } else {
      if (lastNote) {
        lastNote.message += '\n' + sent;
      } else {
        const prov = createProvision(`Provision${plen}`);
        prov.condition = sent;
        prov.ref.add(refid);
        prov.modality = detectModality(sent);
        model.provisions[prov.id] = prov;
        process.provision.add(prov.id);
        plen++;
        if (prov.modality !== '') {
          const pos = prov.condition
            .toLowerCase()
            .search(prov.modality.toLowerCase());
          const longParty = prov.condition.substring(0, pos);
          const punpos = findLastPunctation(longParty);
          const party = (
            punpos !== -1 ? longParty.substring(punpos + 1) : longParty
          ).trim();
          const words = party
            .split(/\s+/)
            .map(x => x.toLowerCase())
            .filter(filterWord)
            .map(replaceMultiples);
          if (words.length <= 5 && words.length > 0) {
            const formed = words.join(' ');
            if (isBanned(formed)) {
              const roleName = capital(formed);
              const roleid = words.join('');
              if (roles[roleid]) {
                roles[roleid].count++;
              } else {
                roles[roleid] = {
                  id    : roleid,
                  title : roleName,
                  count : 1,
                };
              }
              if (role) {
                if (roles[roleid].count > role.count) {
                  role = roles[roleid];
                }
              } else {
                role = roles[roleid];
              }
            }
          }
        }
      }
    }
    const results = [...sent.matchAll(/(ISO|BS|EN)(ISO|BS|EN|\s)+\d+/g)];
    for (const link of results) {
      const text = link[0];
      const findNum = text.match(/\d+/);
      if (findNum) {
        const num = findNum[0];
        if (text.includes('BS')) {
          const id = `BS${num}`;
          createLink(id, text, model);
          process.links.add(id);
        } else if (text.includes('ISO')) {
          const id = `ISO${num}`;
          createLink(id, text, model);
          process.links.add(id);
        }
      }
    }
  }

  const subsecs = Object.values(sec.secs);
  if (subsecs.length > 0) {
    const [page, start] = createNewPage(model);
    model.pages[page.id] = page;
    model.elements[start.id] = start;
    process.page = page.id;
    for (const ss of subsecs) {
      readDetails(ss, model, page);
    }
    const processes = Object.values(page.childs)
      .map(x => model.elements[x.element])
      .filter(x => isEditorProcess(x))
      .map(x => x as EditorProcess);
    for (const p of processes) {
      if (p.actor !== '') {
        const actor = model.roles[p.actor];
        if (roles[actor.id]) {
          roles[actor.id].count++;
        } else {
          roles[actor.id] = {
            id    : actor.id,
            title : actor.name,
            count : 1,
          };
        }
        if (role) {
          if (roles[actor.id].count > role.count) {
            role = roles[actor.id];
          }
        } else {
          role = roles[actor.id];
        }
      }
    }
  }

  if (role) {
    if (model.roles[role.id] === undefined) {
      const newRole = createRole(role.id);
      newRole.name = role.title;
      model.roles[role.id] = newRole;
    }
    process.actor = role.id;
  }
}

function filterWord(x: string): boolean {
  const list = ['the', 'a', 'an', 'this', 'each', 'when', '-', 'these'];
  return x.trim() !== '' && !list.includes(x);
}

function isBanned(x: string): boolean {
  const list = ['it', 'which', 'this', 'these'];
  return !list.includes(x);
}

function replaceMultiples(x: string): string {
  return dictionary[x] ?? x;
}

function capital(x: string): string {
  return x.charAt(0).toUpperCase() + x.slice(1);
}

function createLink(id: string, text: string, model: EditorModel) {
  if (model.links[id] === undefined) {
    const newLink: MMELLink = {
      id,
      title       : text,
      description : text,
      link        : id,
      type        : 'REPO',
      datatype    : DataType.LINK,
    };
    model.links[id] = newLink;
  }
}

const dictionary: Record<string, string> = {
  competencies      : 'competency',
  issues            : 'issue',
  partners          : 'partner',
  organizations     : 'organization',
  teams             : 'team',
  sers              : 'ser',
  relationships     : 'relationship',
  evalutations      : 'evalutation',
  objectives        : 'objective',
  interdependencies : 'interdependency',
  skills            : 'skill',
  opportunities     : 'opportunity',
  processes         : 'process',
  arrangements      : 'arrangement',
  agreements        : 'agreement',
  records           : 'record',
  evaluations       : 'evaluation',
  results           : 'result',
  conclusions       : 'conclusion',
  actions           : 'action',
  risks             : 'risk',
  measures          : 'measure',
  tasks             : 'task',
  activities        : 'activity',
  initiatives       : 'initiative',
};
