import type { MMELFigure } from '@paneron/libmmel/interface/supportinterface';
import type { EditorNode } from '@/smart/model/editormodel';
import { isEditorProcess } from '@/smart/model/editormodel';
import type { UndoReducerInterface } from '@/smart/model/editor/interface';
import type { ModelAction } from '@/smart/model/editor/model';
import type { ItemAction } from '@/smart/model/editor/components/itemTemplate';
import { useItems } from '@/smart/model/editor/components/itemTemplate';

type command = 'figure';
type ownType = MMELFigure;
const value = 'figure';

export type FigAction = ItemAction<ownType, command> & {
  cascade?: ModelAction[];
};

export function useFigure(
  x: Record<string, ownType>
): UndoReducerInterface<Record<string, ownType>, FigAction> {
  return useItems<ownType, command>(x, value);
}

export function cascadeCheckFigure(
  elms: Record<string, EditorNode>,
  action: FigAction
): ModelAction[] | undefined {
  if (action.cascade) {
    return undefined;
  }
  if (action.task === 'delete') {
    const affected: [string[], string][] = action.value.map(x => [
      findAffectedElements(elms, x),
      x,
    ]);
    action.cascade = affected.map(([ids, id]) => ({
      type    : 'model',
      act     : 'elements',
      task    : 'cascade',
      subtask : 'process-figure',
      from    : id,
      to      : undefined,
      ids,
    }));
    return affected.map(([ids, id]) => ({
      type    : 'model',
      act     : 'elements',
      task    : 'cascade',
      subtask : 'process-figure',
      from    : undefined,
      to      : id,
      ids,
    }));
  } else if (action.task === 'edit') {
    const ids = findAffectedElements(elms, action.id);
    action.cascade = [
      {
        type    : 'model',
        act     : 'elements',
        task    : 'cascade',
        subtask : 'process-figure',
        from    : action.id,
        to      : action.value.id,
        ids,
      },
    ];
    return [
      {
        type    : 'model',
        act     : 'elements',
        task    : 'cascade',
        subtask : 'process-figure',
        to      : action.id,
        from    : action.value.id,
        ids,
      },
    ];
  }
  return [];
}

function findAffectedElements(
  elms: Record<string, EditorNode>,
  id: string
): string[] {
  const ids: string[] = [];
  for (const x in elms) {
    const elm = elms[x];
    if (isEditorProcess(elm)) {
      if (elm.figures.has(id)) {
        ids.push(x);
      }
    }
  }
  return ids;
}
