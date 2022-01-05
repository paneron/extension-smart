import { MMELEdge } from '../../../serialize/interface/flowcontrolinterface';
import { EditorEGate, EditorModel, isEditorEgate } from '../../editormodel';
import { ModelAction } from '../model';

type EGateEditAction = {
  task: 'egate-edit';
  id: string;
  page: string;
  update: EditorEGate;
  edges: MMELEdge[];
};

type EXPORT_ACTION = EGateEditAction;

export type HyEditAction = EXPORT_ACTION & {
  act: 'hybird-edit';
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
  const ract = reverse(action, model);
  const p = model.pages[page];
  const edges: Record<string, MMELEdge> = {};
  for (const e of action.edges) {
    edges[e.id] = { ...e };
  }
  if (action.actions === undefined) {
    if (action.id !== action.update.id) {
      for (const e in p.edges) {
        const edge = edges[e] ? edges[e] : { ...p.edges[e] };
        if (edge.from === action.id) {
          edge.from = action.update.id;
          edges[e] = edge;
        }
        if (edge.to === action.id) {
          edge.to = action.update.id;
          edges[e] = edge;
        }
      }
    }
    const actions: ModelAction[] = [
      {
        type: 'model',
        act: 'elements',
        task: 'edit',
        subtask: 'flowunit',
        id: action.id,
        value: action.update,
      },
      {
        type: 'model',
        act: 'pages',
        task: 'edit-edge',
        page,
        value: Object.values(edges),
      },
    ];
    action.actions = actions;
    if (ract && ract.act === 'hybird-edit') {
      ract.actions = [
        {
          type: 'model',
          act: 'elements',
          task: 'edit',
          subtask: 'flowunit',
          id: action.update.id,
          value: model.elements[action.id],
        },
        {
          type: 'model',
          act: 'pages',
          task: 'edit-edge',
          page,
          value: Object.values(edges).map(x => p.edges[x.id]),
        },
      ];
    }
  }
  return ract;
}

function reverse(
  action: HyEditAction,
  model: EditorModel
): ModelAction | undefined {
  if (action.task === 'egate-edit') {
    const page = model.pages[action.page];
    const elm = model.elements[action.id];
    if (isEditorEgate(elm)) {
      return {
        task: 'egate-edit',
        id: action.update.id,
        page: action.page,
        update: elm,
        edges: action.edges.map(x => page.edges[x.id]),
        act: 'hybird-edit',
        type: 'model',
      };
    }
  }
  return undefined;
}
