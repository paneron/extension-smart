import {
  MMELProvision,
  MMELReference,
} from '../../../serialize/interface/supportinterface';
import { EditorNode, isEditorDataClass } from '../../editormodel';
import { UndoReducerInterface } from '../interface';
import { ModelAction } from '../model';
import { ItemAction, useItems } from './itemTemplate';

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
  action: RefAction
): ModelAction[] | undefined {
  if (action.cascade) {
    return undefined;
  }
  if (action.task === 'edit') {
    const [dcs, pros] = findAffectedElements(elms, provisions, action.id);
    action.cascade = [
      {
        type: 'model',
        act: 'elements',
        task: 'cascade',
        subtask: 'process-ref',
        from: action.id,
        to: action.value.id,
        ids: dcs,
      },
      {
        type: 'model',
        act: 'provision',
        task: 'cascade',
        subtask: 'process-ref',
        from: action.id,
        to: action.value.id,
        ids: pros,
      },
    ];
    return [
      {
        type: 'model',
        act: 'elements',
        task: 'cascade',
        subtask: 'process-ref',
        to: action.id,
        from: action.value.id,
        ids: dcs,
      },
      {
        type: 'model',
        act: 'provision',
        task: 'cascade',
        subtask: 'process-ref',
        to: action.id,
        from: action.value.id,
        ids: pros,
      },
    ];
  } else if (action.task === 'delete') {
    const affected: [[string, string[]][], string[], string][] =
      action.value.map(x => [...findAffectedElements(elms, provisions, x), x]);
    action.cascade = affected.flatMap(([dcids, pros, id]) => [
      {
        type: 'model',
        act: 'elements',
        task: 'cascade',
        subtask: 'process-ref',
        to: undefined,
        from: id,
        ids: dcids,
      },
      {
        type: 'model',
        act: 'provision',
        task: 'cascade',
        subtask: 'process-ref',
        to: undefined,
        from: id,
        ids: pros,
      },
    ]);
    return affected.flatMap(([dcids, pros, id]) => [
      {
        type: 'model',
        act: 'elements',
        task: 'cascade',
        subtask: 'process-ref',
        from: undefined,
        to: id,
        ids: dcids,
      },
      {
        type: 'model',
        act: 'provision',
        task: 'cascade',
        subtask: 'process-ref',
        from: undefined,
        to: id,
        ids: pros,
      },
    ]);
  }
  return [];
}

function findAffectedElements(
  elms: Record<string, EditorNode>,
  provisions: Record<string, MMELProvision>,
  id: string
): [[string, string[]][], string[]] {
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
  return [dcs, pros];
}
