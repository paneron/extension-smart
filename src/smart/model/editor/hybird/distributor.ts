import { MMELEdge } from '../../../serialize/interface/flowcontrolinterface';
import {
  MMELLink,
  MMELNote,
  MMELProvision,
} from '../../../serialize/interface/supportinterface';
import { EditorEGate, EditorModel, EditorProcess } from '../../editormodel';
import { ModelAction } from '../model';
import { compileEGateEdit } from './egateedit';
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

type EXPORT_ACTION =
  | EGateEditAction
  | ProcessAddPageAction
  | ProcessRemovePageAction
  | ProcessEditAction
  | ProcessDeleteAction
  | ReverseProcessDeleteAction
  | ProcessBringInAction
  | ProcessBringOutAction;

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
  }
}
