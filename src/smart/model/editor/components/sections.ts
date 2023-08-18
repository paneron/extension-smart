import type { MMELTextSection } from '@paneron/libmmel/interface/supportinterface';
import type { UndoReducerInterface } from '@/smart/model/editor/interface';
import type { ItemAction } from '@/smart/model/editor/components/itemTemplate';
import { useItems } from '@/smart/model/editor/components/itemTemplate';

type command = 'section';
const value = 'section';

export type SectionAction = ItemAction<MMELTextSection, command>;

export function useSections(
  x: Record<string, MMELTextSection>
): UndoReducerInterface<Record<string, MMELTextSection>, SectionAction> {
  return useItems<MMELTextSection, command>(x, value);
}
