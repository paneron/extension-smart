import { MMELTerm } from '@paneron/libmmel/interface/supportinterface';
import { UndoReducerInterface } from '@/smart/model/editor/interface';
import { ItemAction, useItems } from '@/smart/model/editor/components/itemTemplate';

type command = 'terms';
type ownType = MMELTerm;
const value = 'terms';

export type TermsAction = ItemAction<ownType, command>;

export function useTerms(
  x: Record<string, ownType>
): UndoReducerInterface<Record<string, ownType>, TermsAction> {
  return useItems<ownType, command>(x, value);
}
