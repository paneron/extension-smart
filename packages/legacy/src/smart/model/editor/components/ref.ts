import {
  MMELNote,
  MMELProvision,
  MMELReference,
} from '@paneron/libmmel/interface/supportinterface';
import { EditorNode, isEditorDataClass } from '@/smart/model/editormodel';
import { UndoReducerInterface } from '@/smart/model/editor/interface';
import { ModelAction } from '@/smart/model/editor/model';
import { ItemAction, useItems } from '@/smart/model/editor/components/itemTemplate';

type command = 'refs';
type ownType = MMELReference;
const value = 'refs';

export type RefAction = ItemAction<ownType, command> & {
  cascade?: ModelAction[];
};

export function useRefs(
  x: Record<string, ownType>
): UndoReducerInterface<Record<string, ownType>, RefAction> {
  return useItems<ownType, command>(x, value);
}

export function cascadeCheckRefs(
  elms: Record<string, EditorNode>,
  provisions: Record<string, MMELProvision>,
  notes: Record<string, MMELNote>,
  action: RefAction
): ModelAction[] | undefined {
  if (action.cascade) {
    return undefined;
  }
  if (action.task === 'edit') {
    const [dcs, pros, nids] = findAffectedElements(
      elms,
      provisions,
      notes,
      action.id
    );
    action.cascade = [
      {
        type    : 'model',
        act     : 'elements',
        task    : 'cascade',
        subtask : 'process-ref',
        from    : action.id,
        to      : action.value.id,
        ids     : dcs,
      },
      {
        type    : 'model',
        act     : 'provision',
        task    : 'cascade',
        subtask : 'process-ref',
        from    : action.id,
        to      : action.value.id,
        ids     : pros,
      },
      {
        type    : 'model',
        act     : 'notes',
        task    : 'cascade',
        subtask : 'process-ref',
        from    : action.id,
        to      : action.value.id,
        ids     : nids,
      },
    ];
    return [
      {
        type    : 'model',
        act     : 'elements',
        task    : 'cascade',
        subtask : 'process-ref',
        to      : action.id,
        from    : action.value.id,
        ids     : dcs,
      },
      {
        type    : 'model',
        act     : 'provision',
        task    : 'cascade',
        subtask : 'process-ref',
        to      : action.id,
        from    : action.value.id,
        ids     : pros,
      },
      {
        type    : 'model',
        act     : 'notes',
        task    : 'cascade',
        subtask : 'process-ref',
        to      : action.id,
        from    : action.value.id,
        ids     : nids,
      },
    ];
  } else if (action.task === 'delete') {
    const affected: [[string, string[]][], string[], string[], string][] =
      action.value.map(x => [
        ...findAffectedElements(elms, provisions, notes, x),
        x,
      ]);
    action.cascade = affected.flatMap(([dcids, pros, nids, id]) => [
      {
        type    : 'model',
        act     : 'elements',
        task    : 'cascade',
        subtask : 'process-ref',
        to      : undefined,
        from    : id,
        ids     : dcids,
      },
      {
        type    : 'model',
        act     : 'provision',
        task    : 'cascade',
        subtask : 'process-ref',
        to      : undefined,
        from    : id,
        ids     : pros,
      },
      {
        type    : 'model',
        act     : 'notes',
        task    : 'cascade',
        subtask : 'process-ref',
        to      : undefined,
        from    : id,
        ids     : nids,
      },
    ]);
    return affected.flatMap(([dcids, pros, nids, id]) => [
      {
        type    : 'model',
        act     : 'elements',
        task    : 'cascade',
        subtask : 'process-ref',
        from    : undefined,
        to      : id,
        ids     : dcids,
      },
      {
        type    : 'model',
        act     : 'provision',
        task    : 'cascade',
        subtask : 'process-ref',
        from    : undefined,
        to      : id,
        ids     : pros,
      },
      {
        type    : 'model',
        act     : 'notes',
        task    : 'cascade',
        subtask : 'process-ref',
        from    : undefined,
        to      : id,
        ids     : nids,
      },
    ]);
  }
  return [];
}

function findAffectedElements(
  elms: Record<string, EditorNode>,
  provisions: Record<string, MMELProvision>,
  notes: Record<string, MMELNote>,
  id: string
): [[string, string[]][], string[], string[]] {
  const dcs: [string, string[]][] = [];
  for (const x in elms) {
    const elm = elms[x];
    if (isEditorDataClass(elm)) {
      const att: string[] = [];
      for (const [aid, attribute] of Object.entries(elm.attributes)) {
        if (attribute.ref.has(id)) {
          att.push(aid);
        }
      }
      if (att.length > 0) {
        dcs.push([x, att]);
      }
    }
  }
  const pros = Object.values(provisions)
    .filter(x => x.ref.has(id))
    .map(x => x.id);
  const nids = Object.values(notes)
    .filter(x => x.ref.has(id))
    .map(x => x.id);
  return [dcs, pros, nids];
}
