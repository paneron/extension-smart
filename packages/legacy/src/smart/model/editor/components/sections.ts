import { MMELTextSection } from '@paneron/libmmel/interface/supportinterface';
import { UndoReducerInterface } from '../interface';
import { ItemAction, useItems } from './itemTemplate';

type command = 'section';
const value = 'section';

export type SectionAction = ItemAction<MMELTextSection, command>;

export function useSections(
  x: Record<string, MMELTextSection>
): UndoReducerInterface<Record<string, MMELTextSection>, SectionAction> {
  return useItems<MMELTextSection, command>(x, value);
}
