import { MMELRole } from '@paneron/libmmel/interface/supportinterface';
import { RoleAttribute } from '../../../utils/handler/cascadeModelHandler';
import {
  EditorNode,
  isEditorApproval,
  isEditorProcess,
} from '../../editormodel';
import { UndoReducerInterface } from '../interface';
import { ModelAction } from '../model';
import { ItemAction, useItems } from './itemTemplate';

type command = 'roles';
type ownType = MMELRole;
const value = 'roles';

export type RoleAction = ItemAction<ownType, command> & {
  cascade?: ModelAction[];
};

export function useRoles(
  x: Record<string, ownType>
): UndoReducerInterface<Record<string, ownType>, RoleAction> {
  return useItems<ownType, command>(x, value);
}

export function cascadeCheckRole(
  elms: Record<string, EditorNode>,
  action: RoleAction
): ModelAction[] | undefined {
  if (action.cascade) {
    return undefined;
  }
  if (action.task === 'edit') {
    const affected = findAffectedElements(elms, action.id);
    action.cascade = [
      {
        type    : 'model',
        act     : 'elements',
        task    : 'cascade',
        subtask : 'process-role',
        ids     : affected,
        role    : action.value.id,
      },
    ];
    return [
      {
        type    : 'model',
        act     : 'elements',
        task    : 'cascade',
        subtask : 'process-role',
        ids     : affected,
        role    : action.id,
      },
    ];
  } else if (action.task === 'delete') {
    const affected: [[string, RoleAttribute[]][], string][] = action.value.map(
      x => [findAffectedElements(elms, x), x]
    );
    const ids = affected.flatMap(x => x[0]);
    action.cascade = [
      {
        type    : 'model',
        act     : 'elements',
        task    : 'cascade',
        subtask : 'process-role',
        ids     : ids,
        role    : '',
      },
    ];
    return affected.map(([ids, role]) => ({
      type    : 'model',
      act     : 'elements',
      task    : 'cascade',
      subtask : 'process-role',
      ids,
      role,
    }));
  }
  return [];
}

function findAffectedElements(
  elms: Record<string, EditorNode>,
  id: string
): [string, RoleAttribute[]][] {
  const found: [string, RoleAttribute[]][] = [];
  for (const x in elms) {
    const elm = elms[x];
    if (isEditorApproval(elm)) {
      const att: RoleAttribute[] = [];
      if (elm.actor === id) {
        att.push('actor');
      }
      if (elm.approver === id) {
        att.push('approver');
      }
      if (att.length > 0) {
        found.push([x, att]);
      }
    } else if (isEditorProcess(elm)) {
      if (elm.actor === id) {
        found.push([x, ['actor']]);
      }
    }
  }
  return found;
}
