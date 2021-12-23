// undo / redo returns the opposite action
export type ACTION_INTERFACE<A> = (a:A) => A | undefined;
type INIT_INTERFACE<S> = (s:S) => void;
type NEW_ACTION<A> = (a:A) => void;
type EDIT_ACTION = undefined | (() => void);

// type, action (the command), initialier
export type UndoReducerInterface<S, A> = [S, ACTION_INTERFACE<A>, INIT_INTERFACE<S>];

// type, new action, undo, redo
export type UndoManagerInterface<S, A> = [S, NEW_ACTION<A>, EDIT_ACTION, EDIT_ACTION, INIT_INTERFACE<S>];