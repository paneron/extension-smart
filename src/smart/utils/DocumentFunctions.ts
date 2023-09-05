import React from 'react';
import type { DocMapIndex, MMELDocument } from '@/smart/model/document';
import type { MappingType } from '@/smart/model/mapmodel';
import { DOCVERSION } from '@/smart/utils/constants';
import { createNewMMELDocument } from '@/smart/utils/EditorFactory';
import * as Logger from '@/lib/logger';

function addMetaField(doc: MMELDocument, id: string, value: string) {
  if (id === 'namespace') {
    doc.id = value;
  } else if (id === 'title') {
    doc.title = value;
  } else if (id === 'version') {
    doc.version = value;
  } else {
    throw new Error(`Unknown line ${id}#${value}`);
  }
}

function addStatement(
  doc: MMELDocument,
  clause: string,
  statement: string,
  append: boolean
) {
  const id = Object.keys(doc.states).length.toString();
  if (
    doc.sections.length === 0 ||
    doc.sections[doc.sections.length - 1].id !== clause
  ) {
    doc.sections.push({
      id       : clause,
      contents : [[id]],
    });
    doc.states[id] = {
      id,
      text      : statement,
      clause,
      paragraph : 1,
      index     : 1,
      uiref     : React.createRef(),
    };
  } else {
    const lastSec = doc.sections[doc.sections.length - 1];
    if (append) {
      const lastPara = lastSec.contents[lastSec.contents.length - 1];
      lastPara.push(id);
    } else {
      lastSec.contents.push([id]);
    }
    doc.states[id] = {
      id,
      text      : statement,
      clause,
      paragraph : lastSec.contents.length,
      index     : lastSec.contents[lastSec.contents.length - 1].length,
      uiref     : React.createRef(),
    };
  }
}

export function docToText(x: MMELDocument): string {
  let out = `namespace#${x.id}\n`;
  out += `title#${x.title}\n`;
  out += `version#${x.version}\n`;
  out += '###\n';
  for (const sec of x.sections) {
    for (const p of sec.contents) {
      for (const line of p) {
        out += `${sec.id}#${x.states[line].text}\n`;
      }
      out += '\n';
    }
  }
  return out;
}

function isClausePart(x: string): boolean {
  return (x >= '0' && x <= '9') || x === '.';
}

function extractClause(x: string): string {
  let index = 0;
  while (index < x.length && isClausePart(x.charAt(index))) {
    index++;
  }
  return x.substring(0, index);
}

function filterClasue(x: string): string {
  let index = x.length - 1;
  while (index >= 0 && x.charAt(index) === '.') {
    index--;
  }
  if (index < 0) {
    return '';
  }
  return x.substring(0, index + 1);
}

export function plainToDoc(data: string): MMELDocument {
  const doc = createNewMMELDocument();
  const lines = data
    .split('\n')
    .map(x => x.trim())
    .filter(x => x !== '');
  let start = true;
  let lastClause = '';
  let title = '';
  for (const l of lines) {
    const clauseUnProcess = extractClause(l);
    const clause = filterClasue(clauseUnProcess);
    if (clause !== '') {
      start = false;
      lastClause = clause;
    }
    const rest = l.substring(clauseUnProcess.length).trim();
    if (start) {
      if (title === '') {
        title = rest;
      } else {
        title += ' ' + rest;
      }
    } else {
      addStatement(doc, lastClause, rest, clause === lastClause);
    }
  }
  doc.title = title;
  return doc;
}

export function textToDoc(data: string): MMELDocument {
  const doc: MMELDocument = {
    states   : {},
    id       : '',
    title    : '',
    sections : [],
    type     : 'document',
    version  : '',
  };
  const lines = data.split('\n');
  let metaMode = true;
  let consecutive = true;
  for (const line of lines) {
    if (line === '###') {
      metaMode = false;
    } else {
      const index = line.indexOf('#');
      // a line starting with just # is also problematic
      if (index > 0) {
        const [field, content] = [
          line.substring(0, index),
          line.substring(index + 1),
        ];
        if (metaMode) {
          addMetaField(doc, field, content);
        } else {
          addStatement(doc, field, content, consecutive);
        }
        consecutive = true;
      } else if (line.trim() !== '') {
        throw new Error(`Unknown line ${line}`);
      } else {
        consecutive = false;
      }
    }
  }
  if (doc.version !== DOCVERSION) {
    Logger.error(
      `Warning: Document versions do not match.\nDocument version of file: ${doc.version}.\nExpected: ${DOCVERSION}.`
    );
    doc.version = DOCVERSION;
  }
  return doc;
}

export function calculateDocumentMapping(mappings: MappingType): DocMapIndex {
  const index: DocMapIndex = {};
  for (const from in mappings) {
    const map = mappings[from];
    for (const to in map) {
      index[to] = [...(index[to] ?? []), from];
    }
  }
  return index;
}

export function getDocumentMetaById(doc: MMELDocument, id: string): string {
  const statement = doc.states[id];
  if (statement !== undefined) {
    const { clause, paragraph, index } = statement;
    return `Clause ${clause} Para ${paragraph} Statement ${index}`;
  }
  return 'Statement not found';
}
