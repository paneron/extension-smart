import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import { EditorModel } from '@/smart/model/editormodel';
import {
  MMELNote,
  NOTE_TYPE,
  NOTE_TYPES,
} from '@paneron/libmmel/interface/supportinterface';
import { getModelAllRefs } from '@/smart/utils/ModelFunctions';
import {
  MultiReferenceSelector,
  NormalComboBox,
  NormalTextField,
} from '../common/fields';
import { IMMELObject } from '@/smart/ui/common/listmanagement/listPopoverItem';

export function matchNoteFilter(x: IMMELObject, filter: string): boolean {
  const note = x as MMELNote;
  return filter === '' || note.message.toLowerCase().includes(filter);
}

export const NoteItem: React.FC<{
  object: MMELNote;
  model?: EditorModel;
  setObject: (obj: MMELNote) => void;
}> = ({ object: note, model, setObject: setNote }) => {
  const refs = getModelAllRefs(model!).map(r => r.id);

  return (
    <FormGroup>
      <NormalComboBox
        text="Note type"
        value={note.type}
        options={NOTE_TYPES}
        onChange={x => setNote({ ...note, type : x as NOTE_TYPE })}
      />
      <NormalTextField
        text="Message"
        value={note.message}
        onChange={x => setNote({ ...note, message : x })}
      />
      <MultiReferenceSelector
        text="Reference"
        options={refs}
        values={note.ref}
        filterName="Reference filter"
        add={x => setNote({ ...note, ref : new Set([...note.ref, ...x]) })}
        remove={x =>
          setNote({
            ...note,
            ref : new Set([...note.ref].filter(s => !x.has(s))),
          })
        }
      />
    </FormGroup>
  );
};
