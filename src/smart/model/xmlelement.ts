/**
 * No XML parser is used
 * We use our own method to parse XML using brute-force
 */

export type XMLNodeContent = XMLElement | string;

export interface XMLElement {
  tag: string;
  attributes: Record<string, string>;
  childs: XMLNodeContent[];
  xmlChild: Record<string, XMLElement[]>;
}

export enum XMLTokenType {
  STARTTAG,
  ENDTAG,
  SELFCLOSETAG,
  TEXT,
}

export interface XMLToken {
  data: string;
  type: XMLTokenType;
}
