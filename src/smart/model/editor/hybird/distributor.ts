import { MMELEdge } from '../../../serialize/interface/flowcontrolinterface';
import { EditorEGate, EditorModel } from '../../editormodel';
import { ModelAction } from '../model';
import { compileEGateEdit } from './egateedit';
import { compileProcessAddPage, compileProcessRemovePage } from './process';

export type EGateEditAction = {
  task: 'egate-edit';
  id: string;
  page: string;
  update: EditorEGate;
  edges: MMELEdge[];
};

export type ProcessAddPageAction = {
  task: 'process-add-page';
  id: string; // process ID
};

export type ProcessRemovePageAction = {
  task: 'process-remove-page';
  id: string; // process ID
};

type EXPORT_ACTION =
  | EGateEditAction
  | ProcessAddPageAction
  | ProcessRemovePageAction;

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
  }
}
