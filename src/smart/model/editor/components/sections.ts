import { MMELTextSection } from '@paneron/libmmel/interface/supportinterface';
import { UndoReducerInterface } from '@/smart/model/editor/interface';
import { ItemAction, useItems } from '@/smart/model/editor/components/itemTemplate';

type command = 'section';
const value = 'section';

export type SectionAction = ItemAction<MMELTextSection, command>;

export function useSections(
  x: Record<string, MMELTextSection>
): UndoReducerInterface<Record<string, MMELTextSection>, SectionAction> {
  return useItems<MMELTextSection, command>(x, value);
}
