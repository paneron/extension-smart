export interface DocStatement {
  id: string;
  text: string;
}

export type DocParagraph = string[];

export interface DocSection {
  id: string;
  contents: DocParagraph[];
}

export interface MMELDocument {
  states: Record<string, DocStatement>;
  id: string;
  title: string;
  sections: DocSection[];
  type: 'document';
}

export type DocMapIndex = Record<string, string[]>;