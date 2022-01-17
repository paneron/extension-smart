import { EditorModel } from '../../editormodel';
import { ModelAction } from '../model';

export function importElmCommand(
  id: string,
  ref: EditorModel,
  x: number,
  y: number,
  page: string
) {
  const action: ModelAction = {
    type: 'model',
    act: 'hybird',
    task: 'elm-import',
    id,
    ref,
    x,
    y,
    page,
  };
  return action;
}
