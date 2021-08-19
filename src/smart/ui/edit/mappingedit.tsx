/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useState } from 'react';
import {
  EditorApproval,  
  EditorProcess,  
} from '../../model/editormodel';
import { NormalTextField } from '../common/fields';
import { MappingMeta } from '../mapper/mapmodel';
import { FormGroup, Text } from '@blueprintjs/core';
import { EditPageButtons } from './commons';

const MappingEditPage: React.FC<{
  from: EditorProcess | EditorApproval;  
  to: EditorProcess | EditorApproval;
  data: MappingMeta;
  onChange: (update: MappingMeta | null) => void;
}> = function ({ from, to, data, onChange }) {
  const [editing, setEditing] = useState<MappingMeta>({...data});

  return (
    <FormGroup>      
      <EditPageButtons 
        onUpdateClick={() => onChange(editing)}
        onCancelClick={() => onChange(null)}
      />
      <Text> Mapping: {from.name} ( {from.id} ) to {to.name} ( {to.id} ) </Text>      
      <NormalTextField        
        text="Information"
        value={editing.description}
        onChange={x => {          
          setEditing({ ...editing, description: x });
        }}
      />
    </FormGroup>
  )
};

export default MappingEditPage;
