import { HistoryItem } from '../../history';
import { HistoryAction } from '../history';

export function pageChangeCommand(pageid: string, text: string) {
  const item: HistoryItem = {
    page: pageid,
    pathtext: text,
  };
  const action: HistoryAction = {
    type: 'history',
    act: 'push',
    value: [item],
  };
  return action;
}

export function drillUpAction() {
  const action: HistoryAction = {
    type: 'history',
    act: 'pop',
    value: 1,
  };
  return action;
}
