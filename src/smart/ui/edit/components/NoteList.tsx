import { Button, FormGroup } from '@blueprintjs/core';
import React from 'react';
import { useMemo } from 'react';
import { EditorModel } from '../../../model/editormodel';
import { RefTextSelection } from '../../../model/selectionImport';
import { DataType } from '../../../serialize/interface/baseinterface';
import {
  MMELNote,
  MMELReference,
  NOTE_TYPE,
  NOTE_TYPES,
} from '../../../serialize/interface/supportinterface';
import { createNote } from '../../../utils/EditorFactory';
import {
  findUniqueID,
  getModelAllRefs,
  trydefaultID,
} from '../../../utils/ModelFunctions';
import { findExistingRef } from '../../../utils/ModelImport';
import { NormalComboBox, NormalTextField } from '../../common/fields';
import SimpleReferenceSelector from './ReferenceSelector';

const NoteListQuickEdit: React.FC<{
  notes: Record<string, MMELNote>;
  setNotes: (x: Record<string, MMELNote>) => void;
  model: EditorModel;
  selected?: RefTextSelection;
  onAddReference: (refs: Record<string, MMELReference>) => void;
}> = function ({ notes, setNotes, model, selected, onAddReference }) {
  const refs = useMemo(() => getModelAllRefs(model), [model]);

  function addNote() {
    const id = findUniqueID('Note', notes);
    setNotes({ ...notes, [id]: createNote(id) });
  }

  function onImport() {
    if (selected !== undefined) {
      const ref: MMELReference = {
        id: '',
        title: selected.clauseTitle,
        clause: selected.clause,
        document: selected.doc,
        datatype: DataType.REFERENCE,
      };
      const existing = findExistingRef(model, ref, false);
      const refid =
        existing !== null
          ? existing.id
          : trydefaultID(
              `${selected.namespace}-ref${selected.clause.replaceAll(
                '.',
                '-'
              )}`,
              model.refs
            );
      if (existing === null) {
        onAddReference({ ...model.refs, [refid]: { ...ref, id: refid } });
      }

      const id = findUniqueID('Note', notes);
      const newNote: MMELNote = {
        id,
        type: detectType(selected.text),
        message: selected.text,
        ref: new Set<string>([refid]),
        datatype: DataType.NOTE,
      };
      setNotes({ ...notes, [id]: newNote });
    }
  }

  return (
    <FormGroup label="Notes">
      {selected !== undefined && (
        <div
          style={{
            width: '100%',
            marginBottom: '15px',
            textAlign: 'center',
          }}
        >
          <Button intent="primary" onClick={onImport}>
            Import from selection
          </Button>
        </div>
      )}

      {Object.entries(notes).map(([index, n]) => (
        <NoteQuickEdit
          key={index}
          note={n}
          refs={refs}
          setNote={x => setNotes({ ...notes, [index]: x })}
          onDelete={() => {
            const newNotes = { ...notes };
            delete newNotes[index];
            setNotes(newNotes);
          }}
        />
      ))}
      <Button icon="plus" onClick={addNote}>
        Add note
      </Button>
    </FormGroup>
  );
};

const NoteQuickEdit: React.FC<{
  note: MMELNote;
  setNote: (x: MMELNote) => void;
  refs: MMELReference[];
  onDelete: () => void;
}> = function ({ note, setNote, refs, onDelete }) {
  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <fieldset>
        <NormalComboBox
          text="Note type"
          value={note.type}
          options={NOTE_TYPES}
          onChange={x => setNote({ ...note, type: x as NOTE_TYPE })}
        />
        <NormalTextField
          text="Message"
          value={note.message}
          onChange={x => setNote({ ...note, message: x })}
        />
        <SimpleReferenceSelector
          selected={note.ref}
          items={refs}
          onItemSelect={x =>
            setNote({
              ...note,
              ref: new Set([...note.ref, x.id]),
            })
          }
          onTagRemove={x => {
            note.ref = new Set([...note.ref].filter(s => x !== s));
            setNote({ ...note });
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: -8,
            zIndex: 10,
          }}
        >
          <Button intent="danger" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </fieldset>
    </div>
  );
};

interface TypeOption {
  lowerCaseText: string;
  type: NOTE_TYPE;
}

function detectType(text: string): NOTE_TYPE {
  const options: TypeOption[] = NOTE_TYPES.map(x => ({
    lowerCaseText: x.toLowerCase(),
    type: x,
  }));
  const t = text.toLowerCase().trim();
  for (const m of options) {
    if (t.substring(0, m.lowerCaseText.length) === m.lowerCaseText) {
      return m.type;
    }
  }
  return 'NOTE';
}

export default NoteListQuickEdit;
