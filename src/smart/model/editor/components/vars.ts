import { MMELVariable } from '../../../serialize/interface/supportinterface';
import { UndoReducerInterface } from '../interface';
import { ModelAction } from '../model';
import { ItemAction, useItems } from './itemTemplate';

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
