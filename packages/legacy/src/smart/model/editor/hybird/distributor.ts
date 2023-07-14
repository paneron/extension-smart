/**
 * This file contains the handling of the more complex hybird commands
 *
 * The flow is as follows:
 * 1. From the hybird command, generate the set of actions and the set of undo actions. This is done by the 'compile'-series functions
 * 2. Execute the actions
 * A3. If an undo is needed, execute the 'compiled' actions appended to the undo action
 */

import { MMELEdge } from '@paneron/libmmel/interface/flowcontrolinterface';
import {
  MMELLink,
  MMELNote,
  MMELProvision,
  MMELReference,
} from '@paneron/libmmel/interface/supportinterface';
import {
  EditorDataClass,
  EditorEGate,
  EditorModel,
  EditorProcess,
} from '@/smart/model/editormodel';
import { RegistryCombined } from '@/smart/model/editor/components/element/registry';
import { ModelAction } from '@/smart/model/editor/model';
import { compileDCRefImport, compileRegistryRefImport } from '@/smart/model/editor/hybird/data';
import { compileEGateEdit } from '@/smart/model/editor/hybird/egateedit';
import { compileProcessImport } from '@/smart/model/editor/hybird/import';
import {
  compileProcessAddPage,
  compileProcessBringin,
  compileProcessBringout,
  compileProcessDelete,
  compileProcessDeleteReverse,
  compileProcessEdit,
  compileProcessRemovePage,
} from '@/smart/model/editor/hybird/process';

export interface EGateEditAction {
  task: 'egate-edit';
  id: string;
  page: string;
  update: EditorEGate;
  edges: MMELEdge[];
}

export interface ProcessAddPageAction {
  task: 'process-add-page';
  id: string; // process ID
}

export interface ProcessRemovePageAction {
  task: 'process-remove-page';
  id: string; // process ID
}

export interface ProcessEditAction {
  task: 'process-edit';
  id: string;
  process: EditorProcess;
  provisions: MMELProvision[];
  notes: MMELNote[];
  links: MMELLink[];
  newRefs: MMELReference[];
  delRefs: string[];
}

interface ProcessDeleteAction {
  task: 'process-delete';
  id: string;
  page: string;
}

interface ReverseProcessDeleteAction {
  task: 'process-delete-reverse';
  id: string;
  page: string;
}

interface ProcessBringInAction {
  task: 'process-bringin';
  id: string;
  page: string;
}

export interface ProcessBringOutAction {
  task: 'process-bringout';
  id: string;
  page: string;
}

export interface RegistryImportReference {
  task: 'registry-import-ref';
  id: string;
  value: RegistryCombined;
  newRefs: MMELReference[];
  delRefs: string[];
}

export interface DCImportReference {
  task: 'dc-import-ref';
  id: string;
  value: EditorDataClass;
  newRefs: MMELReference[];
  delRefs: string[];
}

export interface ElmImportReference {
  task: 'elm-import';
  id: string;
  ref: EditorModel;
  x: number;
  y: number;
  page: string;
}

type EXPORT_ACTION =
  | EGateEditAction
  | ProcessAddPageAction
  | ProcessRemovePageAction
  | ProcessEditAction
  | ProcessDeleteAction
  | ReverseProcessDeleteAction
  | ProcessBringInAction
  | ProcessBringOutAction
  | RegistryImportReference
  | DCImportReference
  | ElmImportReference;

export type HyEditAction = EXPORT_ACTION & {
  act: 'hybird';
  actions?: ModelAction[];
};

/**
 * Compilation means filling the cascade actions of the hybird actions.
 *
 * @param action the input hybird action
 * @param model the current model
 * @returns the reverse action
 */
export function compileHybird(
  action: HyEditAction,
  model: EditorModel,
  page: string
): ModelAction | undefined {
  switch (action.task) {
    case 'egate-edit':
      return compileEGateEdit(action, model, page);
    case 'process-add-page':
      return compileProcessAddPage(action, model);
    case 'process-remove-page':
      return compileProcessRemovePage(action, model);
    case 'process-edit':
      return compileProcessEdit(action, model);
    case 'process-delete':
      return compileProcessDelete(action, model, page);
    case 'process-bringin':
      return compileProcessBringin(action, model);
    case 'process-bringout':
      return compileProcessBringout(action, model);
    case 'process-delete-reverse':
      return compileProcessDeleteReverse(action);
    case 'registry-import-ref':
      return compileRegistryRefImport(action, model);
    case 'dc-import-ref':
      return compileDCRefImport(action, model);
    case 'elm-import':
      return compileProcessImport(action, model);
  }
}
