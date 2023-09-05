import React, { useState } from 'react';
import { NormalTextField } from '@/smart/ui/common/fields';
import type { MappingMeta } from '@/smart/model/mapmodel';
import { Button, FormGroup } from '@blueprintjs/core';
import { EditPageButtons } from '@/smart/ui/edit/commons';
import { mgdLabel } from '@/css/form';
import MGDDisplayPane from '@/smart/MGDComponents/MGDDisplayPane';
import { wrapperContainer } from '@/css/layout';

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
            setEditing({ ...editing, description : x });
          }}
        />
        <NormalTextField
          text="Justification"
          value={editing.justification}
          onChange={x => {
            setEditing({ ...editing, justification : x });
          }}
        />
        <Button icon="delete" intent="danger" onClick={() => onDelete()}>
          Delete
        </Button>
      </FormGroup>
    </MGDDisplayPane>
  );
};

export default MappingEditPage;
