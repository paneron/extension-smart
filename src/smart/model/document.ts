/**
 * The model for text document. Can be a document translated from XML or a regulation document
 */

import type { RefObject } from 'react';

export interface DocStatement {
  id: string;
  text: string;
  clause: string;
  paragraph: number;
  index: number;
  uiref: RefObject<HTMLSpanElement>;
}

// ids of the statements
export type DocParagraph = string[];

export interface DocSection {
  id: string;
  title?: string;
  contents: DocParagraph[];
}

export interface MMELDocument {
  states: Record<string, DocStatement>;
  id: string;
  title: string;
  sections: DocSection[];
  type: 'document';
  edition?: string;
  sdo?: string;
  version: string;
}

export type DocMapIndex = Record<string, string[]>;
