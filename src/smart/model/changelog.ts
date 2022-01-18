import { ModelAction } from "./editor/model";
import { EditorModel } from "./editormodel";

type CommandEvent = {
  type: 'command';
  command: ModelAction;
}

type NewModelEvent = {
  type: 'new';
}

export type ChangeLog = CommandEvent | NewModelEvent;

export function createChangeLog(model: EditorModel): ChangeLog {
  const command: ModelAction = {
    type: 'model',
    act: 'initModel',
    value: model
  }
  return {
    type: 'command',
    command
  }
}