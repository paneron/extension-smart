import type { MMELVariable } from '@paneron/libmmel/interface/supportinterface';
import type { UndoReducerInterface } from '@/smart/model/editor/interface';
import type { ModelAction } from '@/smart/model/editor/model';
import type { ItemAction } from '@/smart/model/editor/components/itemTemplate';
import { useItems } from '@/smart/model/editor/components/itemTemplate';

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
