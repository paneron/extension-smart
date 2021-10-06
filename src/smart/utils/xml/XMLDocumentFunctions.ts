import React from 'react';
import { DocSection, DocStatement, MMELDocument } from '../../model/document';
import { XMLElement } from '../../model/xmlelement';
import { elementToString, isXMLElement, parseXML } from './XMLParser';

interface CountFigTable {
  fig: number;
  table: number;
}

function getElementValue(xml: XMLElement, name: string): string {
  const array = xml.xmlChild[name];
  if (array === undefined) {
    return '';
  }
  return elementToString(array[0]);
}

function getElementValueByPath(xml: XMLElement, path: string[]): string {
  for (const p of path) {
    const array = xml.xmlChild[p];
    if (array !== undefined && array.length > 0) {
      xml = array[0];
    } else {
      return '';
    }
  }
  return elementToString(xml);
}

// remove unused reference materials that affect text contents
function cleanXML(xml: XMLElement, ids: Record<string, string>) {
  if (xml.xmlChild['concept'] !== undefined) {
    for (const concept of xml.xmlChild['concept']) {
      if (concept.xmlChild['renderterm'] !== undefined) {
        concept.childs = [elementToString(concept.xmlChild['renderterm'][0])];
        concept.xmlChild = {};
      } else if (concept.xmlChild['strong'] !== undefined) {
        concept.childs = [getElementValueByPath(concept, ['strong', 'tt'])];
        concept.xmlChild = {};
      }
    }
  }
  if (xml.tag === 'xref') {
    const target = xml.attributes['target'];
    if (target !== undefined) {
      const resolved = ids[target];
      if (resolved !== undefined) {
        xml.childs.push(resolved);
      }
    }
  }
  for (const c of xml.childs) {
    if (isXMLElement(c)) {
      cleanXML(c, ids);
    }
  }
}

function replaceHTMLCodes(data: string): string {
  const x = data.replaceAll(/&#8212;/g, '—');
  return x.replaceAll(/&#....;/g, ' ');
}

function buildIdMap(xml: XMLElement): Record<string, string> {
  const map: Record<string, string> = {};
  let index = 1;
  const body = xml.xmlChild['sections'];
  if (body !== undefined && body.length > 0) {
    for (const sec of body[0].childs) {
      if (isXMLElement(sec)) {
        if (index === 2 && sec.tag === 'terms') {
          index++;
        }
        mockAddSection(sec, '', index, map);
        index++;
      }
    }
  }
  const annex = xml.xmlChild['annex'];
  if (annex !== undefined) {
    annex.forEach((a, index) => {
      const id = a.attributes['id'];
      if (id !== undefined) {
        map[id] = 'Annex ' + String.fromCharCode(65 + index);
      }
    });
  }
  countFigTable(xml, { fig: 0, table: 0 }, map);
  return map;
}

function countFigTable(
  xml: XMLElement,
  count: CountFigTable,
  map: Record<string, string>
) {
  if (xml.tag === 'table') {
    const id = xml.attributes['id'];
    if (id !== undefined) {
      count.table++;
      map[id] = `Table ${count.table}`;
    }
  } else if (xml.tag === 'figure') {
    const id = xml.attributes['id'];
    if (id !== undefined) {
      count.fig++;
      map[id] = `Figure ${count.fig}`;
    }
  }
  for (const c of xml.childs) {
    if (isXMLElement(c)) {
      countFigTable(c, count, map);
    }
  }
}

function mockAddSection(
  xml: XMLElement,
  prefix: string,
  index: number,
  map: Record<string, string>
) {
  const clause = `${prefix}${index}`;
  const id = xml.attributes['id'];
  if (id !== undefined) {
    map[id] = clause;
  }

  let innerIndex = 1;
  for (const c of xml.childs) {
    if (isXMLElement(c)) {
      if (c.tag === 'clause') {
        mockAddSection(c, clause + '.', innerIndex, map);
        innerIndex++;
      }
    }
  }
}

export function xmlToDocument(data: string): MMELDocument {
  const doc: MMELDocument = {
    states: {},
    id: '',
    title: '',
    sections: [],
    type: 'document',
  };  
  const xml = parseXML(replaceHTMLCodes(data));
  const ids = buildIdMap(xml);
  cleanXML(xml, ids);
  const front = xml.xmlChild['bibdata'];
  if (front !== undefined && front.length > 0) {
    setMeta(doc, front[0]);
  }
  const body = xml.xmlChild['sections'];
  if (body !== undefined && body.length > 0) {
    setMainDoc(doc, body[0]);
  }
  return doc;
}

function setMeta(doc: MMELDocument, xml: XMLElement) {
  if (xml !== undefined) {
    doc.sdo = getElementValueByPath(xml, [
      'contributor',
      'organization',
      'name',
    ]);
    doc.edition = getElementValueByPath(xml, ['version', 'revision-date']);
    const identified = xml.xmlChild['docidentifier'];
    if (identified !== undefined && identified.length > 0) {
      doc.id =
        identified[0].attributes['type'] + elementToString(identified[0]);
    }
    doc.title = doc.id + ' ' + getElementValueByPath(xml, ['title']);
  }
}

function setMainDoc(doc: MMELDocument, xml: XMLElement) {
  let index = 1;
  for (const sec of xml.childs) {
    if (isXMLElement(sec)) {
      if (index === 2 && sec.tag === 'terms') {
        const clause = '2';
        const title = 'Normative references';
        const section = createDocSection(clause, title);
        doc.sections.push(section);
        addStatement(doc, section, title, clause);
        addStatement(
          doc,
          section,
          'There are no normative references in this document',
          clause
        );
        index++;
      }
      addSection(doc, sec, '', index);
      index++;
    }
  }
}

function addSection(
  doc: MMELDocument,
  xml: XMLElement,
  prefix: string,
  index: number
) {
  const clause = `${prefix}${index}`;
  const title = getElementValue(xml, 'title');

  const section = createDocSection(clause, title);
  doc.sections.push(section);
  addStatement(doc, section, title, clause);

  let innerIndex = 1;
  for (const c of xml.childs) {
    if (isXMLElement(c)) {
      if (c.tag === 'clause') {
        addSection(doc, c, clause + '.', innerIndex);
        innerIndex++;
      } else if (c.tag === 'p') {
        addStatement(doc, section, elementToString(c), clause);
      } else if (c.tag === 'ul') {
        processList(doc, section, c, clause, false);
      } else if (c.tag === 'ol') {
        processList(doc, section, c, clause, true);
      } else if (c.tag === 'note') {
        processNote(doc, section, c, clause);
      } else if (c.tag === 'term') {
        addTermsSection(doc, c, clause + '.', innerIndex);
        innerIndex++;
      } else {
        // Other elements are ignored at the moment
        // like tables, figures, note, etc
      }
    } else {
      throw new Error('A section shall not have direct text?');
    }
  }
}

function processNote(
  doc: MMELDocument,
  section: DocSection,
  xml: XMLElement,
  clause: string
) {
  xml.childs.forEach((c, index) => {
    if (isXMLElement(c)) {
      if (c.tag === 'p') {
        addStatement(
          doc,
          section,
          (index === 0 ? 'NOTE\t' : '') + elementToString(c),
          clause
        );
      } else if (c.tag === 'ul') {
        processList(doc, section, c, clause, false);
      } else if (c.tag === 'ol') {
        processList(doc, section, c, clause, true);
      } else {
        // Other elements are ignored at the moment
        // like tables, figures, note, etc
      }
    } else {
      throw new Error('A note shall not have direct text?');
    }
  });
}

function addTermsSection(
  doc: MMELDocument,
  xml: XMLElement,
  prefix: string,
  index: number
) {
  const clause = `${prefix}${index}`;
  const title = getElementValue(xml, 'preferred');

  const section = createDocSection(clause, title);
  doc.sections.push(section);
  addStatement(doc, section, title, clause);

  const admitted = xml.xmlChild['admitted'];
  if (admitted !== undefined && admitted.length > 0) {
    for (const ad of admitted) {
      addStatement(doc, section, elementToString(ad), clause);
    }
  }
  const definitions = xml.xmlChild['definition'];

  if (definitions !== undefined) {
    const definition = definitions[0];
    let defText = '';
    for (const c of definition.childs) {
      if (isXMLElement(c)) {
        if (c.tag === 'ul' || c.tag === 'ol') {
          if (defText !== '') {
            addStatement(doc, section, defText, clause);
            defText = '';
          }
          processList(doc, section, c, clause, c.tag === 'ol');
        } else {
          defText += elementToString(c);
        }
      } else {
        defText += c;
      }
    }
    if (defText !== '') {
      addStatement(doc, section, defText, clause);
    }
  }

  const notes = xml.xmlChild['termnote'];
  if (notes !== undefined) {
    notes.forEach((note, index) => {
      note.childs.forEach((c, pIndex) => {
        if (isXMLElement(c)) {
          if (c.tag === 'ul') {
            processList(doc, section, c, clause, false);
          } else {
            if (pIndex === 0) {
              addStatement(
                doc,
                section,
                `Note ${index + 1} to entry: ${elementToString(c)}`,
                clause
              );
            } else {
              addStatement(doc, section, elementToString(c), clause);
            }
          }
        } else {
          if (pIndex === 0) {
            addStatement(
              doc,
              section,
              `Note ${index + 1} to entry: ${c}`,
              clause
            );
          } else {
            addStatement(doc, section, c, clause);
          }
        }
      });
    });
  }
}

function createDocSection(clause: string, title: string): DocSection {
  return {
    id: clause,
    title,
    contents: [],
  };
}

function addStatement(
  doc: MMELDocument,
  section: DocSection,
  statement: string,
  clause: string
) {
  const st: DocStatement = {
    id: Object.values(doc.states).length.toString(),
    text: statement,
    clause,
    uiref: React.createRef(),
    paragraph: section.contents.length + 1,
    index: 1,
  };
  doc.states[st.id] = st;
  section.contents.push([st.id]);
}

function processList(
  doc: MMELDocument,
  section: DocSection,
  xml: XMLElement,
  clause: string,
  isNumbering: boolean
) {
  let index = 0;
  for (const c of xml.childs) {
    if (isXMLElement(c)) {
      if (c.tag === 'li') {
        const prefix = isNumbering
          ? String.fromCharCode(97 + index) + ')'
          : '-';
        index++;
        let pindex = 0;
        for (const gc of c.childs) {
          if (isXMLElement(gc)) {
            if (gc.tag === 'p') {
              addStatement(
                doc,
                section,
                (pindex === 0 ? prefix : '') + ' ' + elementToString(gc),
                clause
              );
              pindex++;
            } else if (gc.tag === 'ul') {
              processList(doc, section, gc, clause, false);
            } else if (gc.tag === 'ol') {
              processList(doc, section, gc, clause, true);
            } else {
              // Other elements are ignored at the moment
              // like tables, figures, note, etc
            }
          } else {
            throw new Error(`List item contains direct string? ${c}`);
          }
        }
      } else {
        throw new Error(`List item contains other elements? ${c.tag}`);
      }
    } else {
      throw new Error(`List contains direct string? ${elementToString(xml)}`);
    }
  }
}
