import type { ChangeLog } from '@/smart/model/changelog';
import type { EditorModel } from '@/smart/model/editormodel';
import type { ModelAction } from '@/smart/model/editor/model';

/**
 * For undo / redo, that return the opposite action
 */
export type ACTION_INTERFACE<A> = (a: A) => A | undefined;
type INIT_INTERFACE<S> = (s: S) => void;
type NEW_ACTION<A> = (a: A) => void;
type EDIT_ACTION = undefined | ((log: ChangeLog, user: string) => void);

/**
 * Contains 3 items: data object, action (the command), initialier
 */
export type UndoReducerInterface<S, A> = [
  S,
  ACTION_INTERFACE<A>,
  INIT_INTERFACE<S>
];

// type, new action, undo, redo
export type UndoManagerInterface<S, A> = [
  S,
  NEW_ACTION<A>,
  EDIT_ACTION,
  EDIT_ACTION,
  () => void
];

export type UndoReducerModelInterface = [
  EditorModel,
  (x: ModelAction, page: string) => ModelAction | undefined,
  INIT_INTERFACE<EditorModel>
];
