import type { MMELTerm } from '@paneron/libmmel/interface/supportinterface';
import type { UndoReducerInterface } from '@/smart/model/editor/interface';
import type { ItemAction } from '@/smart/model/editor/components/itemTemplate';
import { useItems } from '@/smart/model/editor/components/itemTemplate';

type command = 'terms';
type ownType = MMELTerm;
const value = 'terms';

export type TermsAction = ItemAction<ownType, command>;

export function useTerms(
  x: Record<string, ownType>
): UndoReducerInterface<Record<string, ownType>, TermsAction> {
  return useItems<ownType, command>(x, value);
}
