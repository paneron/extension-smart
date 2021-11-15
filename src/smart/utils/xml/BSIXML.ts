import React from 'react';
import { DocSection, DocStatement, MMELDocument } from '../../model/document';
import { XMLElement } from '../../model/xmlelement';
import { DOCVERSION } from '../constants';
import { elementToString, isXMLElement, parseXML } from './XMLParser';

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

function isUnwantedElement(x: XMLElement): boolean {
  if (x.tag === 'fn') {
    return true;
  }
  if (x.tag === 'xref' && x.attributes['ref-type'] === 'fn') {
    return true;
  }
  return false;
}

// remove unwanted elements, e.g., footnote fn
function cleanXML(xml: XMLElement) {
  if (xml.xmlChild['fn'] !== undefined) {
    delete xml.xmlChild['fn'];
    xml.childs = xml.childs.filter(
      x => !isXMLElement(x) || !isUnwantedElement(x)
    );
  }
  for (const c of xml.childs) {
    if (isXMLElement(c)) {
      cleanXML(c);
    }
  }
}

export function bsiToDocument(data: string): MMELDocument {
  const xml = parseXML(data);
  cleanXML(xml);
  const front = xml.xmlChild['front'];
  const doc: MMELDocument = {
    states: {},
    id: '',
    title: '',
    sections: [],
    type: 'document',
    version: DOCVERSION,
  };
  if (front !== undefined && front.length > 0) {
    setMeta(doc, front[0]);
  }
  const body = xml.xmlChild['body'];
  if (body !== undefined && body.length > 0) {
    setMainDoc(doc, body[0]);
  }
  return doc;
}

function setMeta(doc: MMELDocument, xml: XMLElement) {
  if (xml !== undefined) {
    doc.sdo = getElementValueByPath(xml, ['iso-meta', 'doc-ident', 'sdo']);
    if (doc.sdo === '') {
      doc.sdo = getElementValueByPath(xml, ['nat-meta', 'doc-ident', 'sdo']);
    }
    doc.edition = getElementValueByPath(xml, [
      'iso-meta',
      'std-ident',
      'edition',
    ]);
    if (doc.edition === '') {
      doc.sdo = getElementValueByPath(xml, [
        'nat-meta',
        'std-ident',
        'edition',
      ]);
    }
    doc.id =
      getElementValueByPath(xml, ['iso-meta', 'std-ident', 'originator']) +
      getElementValueByPath(xml, ['iso-meta', 'std-ident', 'doc-number']);
    if (doc.id === '') {
      doc.id =
        getElementValueByPath(xml, ['nat-meta', 'std-ident', 'originator']) +
        getElementValueByPath(xml, ['nat-meta', 'std-ident', 'doc-number']);
    }
    doc.title = getElementValueByPath(xml, ['iso-meta', 'title-wrap', 'full']);
    if (doc.title === '') {
      doc.title = getElementValueByPath(xml, [
        'nat-meta',
        'title-wrap',
        'full',
      ]);
    }
  }
}

function setMainDoc(doc: MMELDocument, xml: XMLElement) {
  const secs = xml.xmlChild['sec'];
  if (secs !== undefined && secs.length > 0) {
    for (const sec of secs) {
      addSection(doc, sec);
    }
  }
}

function addSection(doc: MMELDocument, xml: XMLElement) {
  const clause = getElementValue(xml, 'label');
  const title = getElementValue(xml, 'title');

  const section = createDocSection(clause, title);
  doc.sections.push(section);
  addStatement(doc, section, title, clause);

  for (const c of xml.childs) {
    if (isXMLElement(c)) {
      if (c.tag === 'label' || c.tag === 'title') {
        // already obtained their values. Ignore these parts
      } else if (c.tag === 'sec') {
        addSection(doc, c);
      } else if (c.tag === 'p') {
        addStatement(doc, section, elementToString(c), clause);
      } else if (c.tag === 'list') {
        processList(doc, section, c, clause);
      } else if (c.tag === 'non-normative-note') {
        addStatement(doc, section, elementToString(c), clause);
      } else if (c.tag === 'ref-list') {
        processRefList(doc, section, c, clause);
      } else if (c.tag === 'term-sec') {
        addTermsSection(doc, c);
      } else {
        // Other elements are ignored at the moment
        // like tables, figures, note, etc
      }
    } else {
      throw new Error('A section shall not have direct text?');
    }
  }
}

function addTermsSection(doc: MMELDocument, xml: XMLElement) {
  const clause = getElementValue(xml, 'label');
  const title = getElementValueByPath(xml, [
    'tbx:termEntry',
    'tbx:langSet',
    'tbx:tig',
    'tbx:term',
  ]);

  const section = createDocSection(clause, title);
  doc.sections.push(section);
  addStatement(doc, section, title, clause);

  const langSet = xml.xmlChild['tbx:termEntry'][0].xmlChild['tbx:langSet'][0];
  const defElement = langSet.xmlChild['tbx:definition'];
  if (defElement !== undefined) {
    const definition = langSet.xmlChild['tbx:definition'][0];

    let defText = '';
    for (const c of definition.childs) {
      if (isXMLElement(c)) {
        if (c.tag === 'list') {
          if (defText !== '') {
            addStatement(doc, section, defText, clause);
            defText = '';
          }
          processList(doc, section, c, clause);
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

    const notes = langSet.xmlChild['tbx:note'];
    if (notes !== undefined) {
      notes.forEach((note, index) => {
        const parts = elementToString(note).split('—');
        parts.forEach((p, pIndex) => {
          if (pIndex === 0) {
            addStatement(
              doc,
              section,
              `Note ${index + 1} to entry: ${p}`,
              clause
            );
          } else {
            addStatement(doc, section, `—${p}`, clause);
          }
        });
      });
    }

    const sources = langSet.xmlChild['tbx:source'];
    if (sources !== undefined) {
      sources.forEach(source => {
        addStatement(
          doc,
          section,
          `[SOURCE: ${elementToString(source)}]`,
          clause
        );
      });
    }
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
  clause: string
) {
  for (const c of xml.childs) {
    if (isXMLElement(c)) {
      if (c.tag === 'list-item') {
        const prefix = getElementValue(c, 'label');
        const paras = c.xmlChild['p'];
        if (paras !== undefined && paras.length > 0) {
          paras.forEach((p, index) => {
            if (index === 0) {
              addStatement(
                doc,
                section,
                prefix + ' ' + elementToString(p),
                clause
              );
            } else {
              addStatement(doc, section, elementToString(p), clause);
            }
          });
        }
        for (const gc of c.childs) {
          if (isXMLElement(gc)) {
            if (gc.tag === 'label' || gc.tag === 'p') {
              // no problem, already processed
            } else if (gc.tag === 'list') {
              processList(doc, section, gc, clause);
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

function processRefList(
  doc: MMELDocument,
  section: DocSection,
  xml: XMLElement,
  clause: string
) {
  const refs = xml.xmlChild['ref'];
  if (refs !== undefined && refs.length > 0) {
    for (const ref of refs) {
      addStatement(doc, section, elementToString(ref), clause);
    }
  }
}
