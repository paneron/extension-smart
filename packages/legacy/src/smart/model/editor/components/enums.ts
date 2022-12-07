import { MMELEnum } from '../../../serialize/interface/datainterface';
import { EditorNode, isEditorDataClass } from '../../editormodel';
import { UndoReducerInterface } from '../interface';
import { ModelAction } from '../model';
import { ItemAction, useItems } from './itemTemplate';

type command = 'enums';
type ownType = MMELEnum;
const value = 'enums';

export type EnumAction = ItemAction<ownType, command> & {
  cascade?: ModelAction[];
};

export function useEnums(
  x: Record<string, ownType>
): UndoReducerInterface<Record<string, ownType>, EnumAction> {
  return useItems<ownType, command>(x, value);
}

export function cascadeCheckEnum(
  elms: Record<string, EditorNode>,
  action: EnumAction
): ModelAction[] | undefined {
  if (action.cascade) {
    return undefined;
  }
  if (action.task === 'delete') {
    const affected: [[string, string[]][], string][] = action.value.map(x => [
      findAffectedElements(elms, x),
      x,
    ]);
    action.cascade = affected.map(([ids]) => ({
      type     : 'model',
      act      : 'elements',
      task     : 'cascade',
      subtask  : 'process-enum',
      datatype : '',
      ids,
    }));
    return affected.map(([ids, id]) => ({
      type     : 'model',
      act      : 'elements',
      task     : 'cascade',
      subtask  : 'process-enum',
      datatype : id,
      ids,
    }));
  } else if (action.task === 'edit') {
    const ids = findAffectedElements(elms, action.id);
    action.cascade = [
      {
        type     : 'model',
        act      : 'elements',
        task     : 'cascade',
        subtask  : 'process-enum',
        datatype : action.value.id,
        ids,
      },
    ];
    return [
      {
        type     : 'model',
        act      : 'elements',
        task     : 'cascade',
        subtask  : 'process-enum',
        datatype : action.id,
        ids,
      },
    ];
  }
  return [];
}

function findAffectedElements(
  elms: Record<string, EditorNode>,
  id: string
): [string, string[]][] {
  const ids: [string, string[]][] = [];
  for (const x in elms) {
    const elm = elms[x];
    if (isEditorDataClass(elm)) {
      const aids: string[] = [];
      for (const a in elm.attributes) {
        const att = elm.attributes[a];
        if (att.type === id) {
          aids.push(a);
        }
      }
      if (aids.length > 0) {
        ids.push([x, aids]);
      }
    }
  }
  return ids;
}
