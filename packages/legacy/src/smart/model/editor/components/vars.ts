import { MMELVariable } from '@paneron/libmmel/interface/supportinterface';
import { UndoReducerInterface } from '@/smart/model/editor/interface';
import { ModelAction } from '@/smart/model/editor/model';
import { ItemAction, useItems } from '@/smart/model/editor/components/itemTemplate';

type command = 'vars';
type ownType = MMELVariable;
const value = 'vars';

export type VarAction = ItemAction<ownType, command> & {
  cascade?: ModelAction[];
};

export function useVars(
  x: Record<string, ownType>
): UndoReducerInterface<Record<string, ownType>, VarAction> {
  return useItems<ownType, command>(x, value);
}
