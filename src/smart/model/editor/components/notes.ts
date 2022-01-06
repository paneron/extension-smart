import { useReducer } from 'react';
import { MMELNote } from '../../../serialize/interface/supportinterface';
import { refNotesReplace } from '../../../utils/handler/cascadeModelHandler';
import { UndoReducerInterface } from '../interface';

type RefCascadeAction = {
  subtask: 'process-ref';
  from: string | undefined; // remove from
  to: string | undefined; // add to
  ids: string[];
};

type CascadeAction = RefCascadeAction & { task: 'cascade' };

type EXPORT_ACTION = CascadeAction;

export type NotesAction = EXPORT_ACTION & { act: 'notes' };

type InitAction = {
  act: 'init';
  value: Record<string, MMELNote>;
};

type OwnAction = NotesAction | InitAction;

function cascadeReducer(
  notes: Record<string, MMELNote>,
  action: CascadeAction
): Record<string, MMELNote> {
  switch (action.subtask) {
    case 'process-ref':
      return refNotesReplace(notes, action.ids, action.from, action.to);
  }
}

function proReducer(
  notes: Record<string, MMELNote>,
  action: NotesAction
): Record<string, MMELNote> {
  switch (action.task) {
    case 'cascade':
      return cascadeReducer(notes, action);
  }
}

function reducer(
  notes: Record<string, MMELNote>,
  action: OwnAction
): Record<string, MMELNote> {
  switch (action.act) {
    case 'init':
      return { ...action.value };
    case 'notes':
      return proReducer({ ...notes }, action);
  }
}

function findReverse(
  notes: Record<string, MMELNote>,
  action: NotesAction
): NotesAction | undefined {
  switch (action.task) {
    case 'cascade':
      return undefined;
  }
}

export function useNotes(
  x: Record<string, MMELNote>
): UndoReducerInterface<Record<string, MMELNote>, NotesAction> {
  const [notes, dispatchElms] = useReducer(reducer, x);

  function act(action: NotesAction): NotesAction | undefined {
    dispatchElms(action);
    return findReverse(notes, action);
  }

  function init(x: Record<string, MMELNote>) {
    dispatchElms({ act: 'init', value: x });
  }

  return [notes, act, init];
}
