import { MMELEdge } from '@paneron/libmmel/interface/flowcontrolinterface';
import { EditorModel, isEditorEgate } from '@/smart/model/editormodel';
import { ModelAction } from '@/smart/model/editor/model';
import { HyEditAction } from '@/smart/model/editor/hybird/distributor';

type EgateHybird = HyEditAction & { task: 'egate-edit' };

export function compileEGateEdit(
  action: EgateHybird,
  model: EditorModel,
  page: string
): ModelAction | undefined {
  const ract = reverseEGateEdit(action, model);
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
        type    : 'model',
        act     : 'elements',
        task    : 'edit',
        subtask : 'flowunit',
        id      : action.id,
        value   : action.update,
      },
      {
        type  : 'model',
        act   : 'pages',
        task  : 'edit-edge',
        page,
        value : Object.values(edges),
      },
    ];
    action.actions = actions;
    if (ract && ract.act === 'hybird') {
      ract.actions = [
        {
          type    : 'model',
          act     : 'elements',
          task    : 'edit',
          subtask : 'flowunit',
          id      : action.update.id,
          value   : model.elements[action.id],
        },
        {
          type  : 'model',
          act   : 'pages',
          task  : 'edit-edge',
          page,
          value : Object.values(edges).map(x => p.edges[x.id]),
        },
      ];
    }
  }
  return ract;
}

function reverseEGateEdit(
  action: EgateHybird,
  model: EditorModel
): ModelAction | undefined {
  const page = model.pages[action.page];
  const elm = model.elements[action.id];
  if (isEditorEgate(elm)) {
    return {
      task   : 'egate-edit',
      id     : action.update.id,
      page   : action.page,
      update : elm,
      edges  : action.edges.map(x => page.edges[x.id]),
      act    : 'hybird',
      type   : 'model',
    };
  }
  return undefined;
}
