import { ModelAction } from './editor/model';
import { EditorModel } from './editormodel';

type CommandEvent = {
  type: 'command';
  command: ModelAction;
};

export type ChangeLogEvent = CommandEvent & {
  user: string;
  time: string;
};

export type ChangeLog = ChangeLogEvent[];

export function createChangeLog(
  model: EditorModel,
  user: string
): ChangeLogEvent {
  const command: ModelAction = {
    type: 'model',
    act: 'initModel',
    value: model,
  };
  return {
    type: 'command',
    command,
    user,
    time: new Date().toISOString(),
  };
}

export function addToLog(log: ChangeLog, user: string, action: ModelAction) {
  log.push({
    type: 'command',
    command: action,
    user,
    time: new Date().toISOString(),
  });
}
