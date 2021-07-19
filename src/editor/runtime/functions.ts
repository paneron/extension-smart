import { MMELReference } from '../serialize/interface/supportinterface';

export function toSummary(r: MMELReference): string {
  if (r.clause === '') {
    return r.document;
  }
  return r.document + ' (' + r.clause + ')';
}
