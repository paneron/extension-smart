import React, { useState } from 'react';
import { NormalTextField } from '../common/fields';
import { MappingMeta } from '../../model/mapmodel';
import { FormGroup } from '@blueprintjs/core';
import { EditPageButtons } from './commons';
import MGDButton from '../../MGDComponents/MGDButton';
import { mgdLabel } from '../../../css/form';
import { MGDButtonType } from '../../../css/MGDButton';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
import { wrapperContainer } from '../../../css/layout';

export interface EditElmInfo {
  id: string;
  name: string;
}

const MappingEditPage: React.FC<{
  from: EditElmInfo;
  to: EditElmInfo;
  data: MappingMeta;
  onChange: (update: MappingMeta | null) => void;
  onDelete: () => void;
}> = function ({ from, to, data, onChange, onDelete }) {
  const [editing, setEditing] = useState<MappingMeta>({ ...data });

  return (
    <MGDDisplayPane>
      <FormGroup>
        <div style={wrapperContainer}>
          <EditPageButtons onUpdateClick={() => onChange(editing)} />
        </div>
        <label style={mgdLabel}>
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
    </MGDDisplayPane>
  );
};

export default MappingEditPage;
