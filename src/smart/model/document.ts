import { RefObject } from "react";

export interface DocStatement {
  id: string;
  text: string;
  clause: string;
  paragraph: number;
  index: number;
  uiref: RefObject<HTMLSpanElement>
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
