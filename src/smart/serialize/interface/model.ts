import { MMELNode } from './baseinterface';
import { MMELEnum } from './datainterface';
import { MMELSubprocess } from './flowcontrolinterface';
import {
  MMELComment,
  MMELFigure,
  MMELLink,
  MMELMetadata,
  MMELNote,
  MMELProvision,
  MMELReference,
  MMELRole,
  MMELTable,
  MMELTerm,
  MMELTextSection,
  MMELVariable,
  MMELView,
} from './supportinterface';

export interface MMELModel {
  meta: MMELMetadata;
  roles: Record<string, MMELRole>;
  provisions: Record<string, MMELProvision>;
  elements: Record<string, MMELNode>;
  refs: Record<string, MMELReference>;
  enums: Record<string, MMELEnum>;
  vars: Record<string, MMELVariable>;
  pages: Record<string, MMELSubprocess>;
  views: Record<string, MMELView>;
  notes: Record<string, MMELNote>;
  terms: Record<string, MMELTerm>;
  tables: Record<string, MMELTable>;
  figures: Record<string, MMELFigure>;
  sections: Record<string, MMELTextSection>;
  links: Record<string, MMELLink>;
  comments: Record<string, MMELComment>;

  root: string;
  version: string;
}
