/**
 * This file centralizes the commands related to page change
 */

import { HistoryItem } from '@/smart/model/history';
import { HistoryAction } from '@/smart/model/editor/history';

/**
 * Go to a new page (subprocess) of a process on the current page
 * @param pageid The page ID
 * @param text The display text of the process (to be shown on breadcrumb)
 */
export function pageChangeCommand(pageid: string, text: string) {
  const item: HistoryItem = {
    page     : pageid,
    pathtext : text,
  };
  const action: HistoryAction = {
    type  : 'history',
    act   : 'push',
    value : [item],
  };
  return action;
}

/**
 * Go up one level
 */
export function drillUpCommand() {
  const action: HistoryAction = {
    type  : 'history',
    act   : 'pop',
    value : 1,
  };
  return action;
}

/**
 * Go to another page (that is indepedent to the current page)
 * Example: triggered by going into a search result
 * @param history The new path to replace the current history
 */
export function replaceHisCommand(history: HistoryItem[]) {
  const action: HistoryAction = {
    type  : 'history',
    act   : 'replace',
    value : history,
  };
  return action;
}
