/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useState } from 'react';
import { EditorApproval, EditorProcess } from '../../model/editormodel';
import { NormalTextField } from '../common/fields';
import { MappingMeta } from '../mapper/mapmodel';
import { Button, FormGroup, Intent, Text } from '@blueprintjs/core';
import { EditPageButtons } from './commons';

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
        <Button
          style={{
            position: 'absolute',
            top: '0px',
            right: '0px',
          }}
          icon="delete"
          intent={Intent.DANGER}
          text="Delete"
          onClick={() => onDelete()}
        />
      </div>
      <Text>
        {' '}
        Mapping: {from.name} ( {from.id} ) to {to.name} ( {to.id} ){' '}
      </Text>
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
    </FormGroup>
  );
};

export default MappingEditPage;
