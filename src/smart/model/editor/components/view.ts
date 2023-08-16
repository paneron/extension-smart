import { MMELView } from '@paneron/libmmel/interface/supportinterface';
import { UndoReducerInterface } from '@/smart/model/editor/interface';
import { ModelAction } from '@/smart/model/editor/model';
import { ItemAction, useItems } from '@/smart/model/editor/components/itemTemplate';

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
