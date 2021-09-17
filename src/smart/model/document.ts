export interface DocStatement {
  id: string;
  text: string;
  type: 'text';
}

export type DocContentType = DocSection | DocStatement;

export interface DocSection {
  id: string;
  contents: DocContentType[];
  type: 'section';
}

export interface MMELDocument {
  states: Record<string, DocStatement>;
  id: string;
  name: string;
  sections: DocSection[];
  type: 'document';
}

export function isDocSection(x: DocContentType): x is DocSection {
  return x.type === 'section';
}

export function isDocStatement(x: DocContentType): x is DocStatement {
  return x.type === 'text';
}

export function textToDoc(data: string): MMELDocument {
  const doc: MMELDocument = {
    states: {},
    id: '',
    name: '',
    sections: [],
    type: 'document',
  };
  return doc;
}
