/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useState } from 'react';
import { EditorApproval, EditorProcess } from '../../model/editormodel';
import { NormalTextField } from '../common/fields';
import { MappingMeta } from '../mapper/mapmodel';
import { FormGroup } from '@blueprintjs/core';
import { EditPageButtons } from './commons';
import MGDButton from '../../MGDComponents/MGDButton';
import { mgd_label } from '../../../css/form';
import { MGDButtonType } from '../../../css/MGDButton';

const MappingEditPage: React.FC<{
  from: EditorProcess | EditorApproval;
  to: EditorProcess | EditorApproval;
  data: MappingMeta;
  onChange: (update: MappingMeta | null) => void;
  onDelete: () => void;
}> = function ({ from, to, data, onChange, onDelete }) {
  const [editing, setEditing] = useState<MappingMeta>({ ...data });

  return (
    <FormGroup>
      <div
        style={{
          position: 'relative',
        }}
      >
        <EditPageButtons
          onUpdateClick={() => onChange(editing)}
          onCancelClick={() => onChange(null)}
        />
      </div>
      <label css={mgd_label}>
        Mapping: {from.name} ( {from.id} ) to {to.name} ( {to.id} )
      </label>
      <NormalTextField
        text="Information"
        value={editing.description}
        onChange={x => {
          setEditing({ ...editing, description: x });
        }}
      />
      <NormalTextField
        text="Justification"
        value={editing.justification}
        onChange={x => {
          setEditing({ ...editing, justification: x });
        }}
      />
      <MGDButton
        icon="delete"
        type={MGDButtonType.Primary}
        onClick={() => onDelete()}
      >
        Delete
      </MGDButton>
    </FormGroup>
  );
};

export default MappingEditPage;
