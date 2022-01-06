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
  compileProcessEdit,
  compileProcessRemovePage,
} from './process';

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

export type ProcessEditAction = {
  task: 'process-edit';
  id: string;
  process: EditorProcess;
  provisions: MMELProvision[];
  notes: MMELNote[];
  links: MMELLink[];
};

type EXPORT_ACTION =
  | EGateEditAction
  | ProcessAddPageAction
  | ProcessRemovePageAction
  | ProcessEditAction;

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
  }
}
