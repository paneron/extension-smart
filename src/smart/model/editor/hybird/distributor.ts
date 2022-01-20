import { MMELEdge } from '../../../serialize/interface/flowcontrolinterface';
import {
  MMELLink,
  MMELNote,
  MMELProvision,
  MMELReference,
} from '../../../serialize/interface/supportinterface';
import {
  EditorDataClass,
  EditorEGate,
  EditorModel,
  EditorProcess,
} from '../../editormodel';
import { RegistryCombined } from '../components/element/registry';
import { ModelAction } from '../model';
import { compileDCRefImport, compileRegistryRefImport } from './data';
import { compileEGateEdit } from './egateedit';
import { compileProcessImport } from './import';
import {
  compileProcessAddPage,
  compileProcessBringin,
  compileProcessBringout,
  compileProcessDelete,
  compileProcessDeleteReverse,
  compileProcessEdit,
  compileProcessRemovePage,
} from './process';

type EGateEditAction = {
  task: 'egate-edit';
  id: string;
  page: string;
  update: EditorEGate;
  edges: MMELEdge[];
};

type ProcessAddPageAction = {
  task: 'process-add-page';
  id: string; // process ID
};

type ProcessRemovePageAction = {
  task: 'process-remove-page';
  id: string; // process ID
};

type ProcessEditAction = {
  task: 'process-edit';
  id: string;
  process: EditorProcess;
  provisions: MMELProvision[];
  notes: MMELNote[];
  links: MMELLink[];
  newRefs: MMELReference[];
  delRefs: string[];
};

type ProcessDeleteAction = {
  task: 'process-delete';
  id: string;
  page: string;
};

type ReverseProcessDeleteAction = {
  task: 'process-delete-reverse';
  id: string;
  page: string;
};

type ProcessBringInAction = {
  task: 'process-bringin';
  id: string;
  page: string;
};

type ProcessBringOutAction = {
  task: 'process-bringout';
  id: string;
  page: string;
};

type RegistryImportReference = {
  task: 'registry-import-ref';
  id: string;
  value: RegistryCombined;
  newRefs: MMELReference[];
  delRefs: string[];
};

type DCImportReference = {
  task: 'dc-import-ref';
  id: string;
  value: EditorDataClass;
  newRefs: MMELReference[];
  delRefs: string[];
};

type ElmImportReference = {
  task: 'elm-import';
  id: string;
  ref: EditorModel;
  x: number;
  y: number;
  page: string;
};

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
