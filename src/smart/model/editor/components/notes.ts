import { useReducer } from 'react';
import { MMELNote } from '@paneron/libmmel/interface/supportinterface';
import { refNotesReplace } from '@/smart/utils/handler/cascadeModelHandler';
import { UndoReducerInterface } from '@/smart/model/editor/interface';

interface RefCascadeAction {
  subtask: 'process-ref';
  from: string | undefined; // remove from
  to: string | undefined; // add to
  ids: string[];
}

interface ReplaceNotesAction {
  task: 'replace';
  from: string[]; // remove from
  to: MMELNote[]; // add to
}

type CascadeAction = RefCascadeAction & { task: 'cascade' };

type EXPORT_ACTION = CascadeAction | ReplaceNotesAction;

export type NotesAction = EXPORT_ACTION & { act: 'notes' };

interface InitAction {
  act: 'init';
  value: Record<string, MMELNote>;
}

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
    case 'replace':
      return notesReplace(notes, action.from, action.to);
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

export function useNotes(
  x: Record<string, MMELNote>
): UndoReducerInterface<Record<string, MMELNote>, NotesAction> {
  const [notes, dispatchElms] = useReducer(reducer, x);

  function act(action: NotesAction): undefined {
    dispatchElms(action);
    return undefined;
  }

  function init(x: Record<string, MMELNote>) {
    dispatchElms({ act : 'init', value : x });
  }

  return [notes, act, init];
}

function notesReplace(
  notes: Record<string, MMELNote>,
  from: string[],
  to: MMELNote[]
): Record<string, MMELNote> {
  for (const f of from) {
    delete notes[f];
  }
  for (const p of to) {
    notes[p.id] = p;
  }
  return notes;
}
