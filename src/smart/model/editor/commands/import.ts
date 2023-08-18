/**
 * This file centralizes the commands related to import
 */

import type { EditorModel } from '@/smart/model/editormodel';
import type { ModelAction } from '@/smart/model/editor/model';

/**
 * Import an element from another model
 * @param id The ID of the imported element
 * @param ref The model containing the element to be imported
 * @param x The location (x-coordinate) of the element
 * @param y The location (y-coordinate) of the element
 * @param page The page ID where the imported model is added
 */
export function importElmCommand(
  id: string,
  ref: EditorModel,
  x: number,
  y: number,
  page: string
): ModelAction {
  const action: ModelAction = {
    type : 'model',
    act  : 'hybird',
    task : 'elm-import',
    id,
    ref,
    x,
    y,
    page,
  };
  return action;
}
