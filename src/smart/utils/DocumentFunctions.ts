import { DocMapIndex, MMELDocument } from "../model/document";
import { MapSet } from "../model/mapmodel";

function addMetaField(doc: MMELDocument, id: string, value: string) {
  if (id === 'namespace') {
    doc.id = value;
  } else if (id === 'title') {
    doc.title = value;
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
  doc.states[id] = {
    id,
    text: statement,
  };
  if (
    doc.sections.length === 0 ||
    doc.sections[doc.sections.length - 1].id !== clause
  ) {
    doc.sections.push({
      id: clause,
      contents: [[id]],
    });
  } else {
    const lastSec = doc.sections[doc.sections.length - 1];
    if (append) {
      const lastPara = lastSec.contents[lastSec.contents.length - 1];
      lastPara.push(id);
    } else {
      lastSec.contents.push([id]);
    }
  }
}

export function textToDoc(data: string): MMELDocument {  
  const doc: MMELDocument = {
    states: {},
    id: '',
    title: '',
    sections: [],
    type: 'document',
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
  return doc;
}

export function calculateDocumentMapping(ms: MapSet):DocMapIndex {
  const index:DocMapIndex = {};
  for (const from in ms.mappings) {
    const map = ms.mappings[from];
    for (const to in map) {
      index[to] = [...index[to]??[], from];      
    }
  }
  return index;
}