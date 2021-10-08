import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import { EditorModel } from '../../model/editormodel';
import {
  MMELNote,
  NOTE_TYPES,
} from '../../serialize/interface/supportinterface';
import { getModelAllRefs } from '../../utils/ModelFunctions';
import {
  MultiReferenceSelector,
  NormalComboBox,
  NormalTextField,
} from '../common/fields';
import { IObject } from '../common/listmanagement/listPopoverItem';

export function matchNoteFilter(x: IObject, filter: string): boolean {
  const note = x as MMELNote;
  return filter === '' || note.message.toLowerCase().includes(filter);
}

export const NoteItem: React.FC<{
  object: Object;
  model?: EditorModel;
  setObject: (obj: Object) => void;
}> = ({ object, model, setObject }) => {
  const note = object as MMELNote;
  const refs = getModelAllRefs(model!).map(r => r.id);

  return (
    <FormGroup>
      <NormalComboBox
        text="Note type"
        value={note.type}
        options={NOTE_TYPES}
        onChange={x => setObject({ ...note, type: x })}
      />
      <NormalTextField
        text="Message"
        value={note.message}
        onChange={x => setObject({ ...note, message: x })}
      />
      <MultiReferenceSelector
        text="Reference"
        options={refs}
        values={note.ref}
        filterName="Reference filter"
        add={x => setObject({ ...note, ref: new Set([...note.ref, ...x]) })}
        remove={x =>
          setObject({
            ...note,
            ref: new Set([...note.ref].filter(s => !x.has(s))),
          })
        }
      />
    </FormGroup>
  );
};
