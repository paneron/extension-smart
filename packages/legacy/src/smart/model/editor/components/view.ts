import { MMELView } from '@paneron/libmmel/interface/supportinterface';
import { UndoReducerInterface } from '../interface';
import { ModelAction } from '../model';
import { ItemAction, useItems } from './itemTemplate';

type command = 'view';
type ownType = MMELView;
const value = 'view';

export type ViewAction = ItemAction<ownType, command> & {
  cascade?: ModelAction[];
};

export function useView(
  x: Record<string, ownType>
): UndoReducerInterface<Record<string, ownType>, ViewAction> {
  return useItems<ownType, command>(x, value);
}
