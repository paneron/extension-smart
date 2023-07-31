import { Button, FormGroup } from '@blueprintjs/core';
import React from 'react';
import MGDDisplayPane from '@/smart/MGDComponents/MGDDisplayPane';
import { MMELDocument } from '@/smart/model/document';
import { NormalTextField } from '@/smart/ui/common/fields';

const DocSettings: React.FC<{
  doc: MMELDocument;
  setDoc: (x: MMELDocument) => void;
  done: () => void;
}> = function ({ doc, setDoc, done }) {
  return (
    <MGDDisplayPane>
      <FormGroup>
        <NormalTextField
          text="Namespace"
          value={doc.id}
          onChange={x => setDoc({ ...doc, id : x })}
        />
        <NormalTextField
          text="Title"
          value={doc.title}
          onChange={x => setDoc({ ...doc, title : x })}
        />
        <Button onClick={done}>Done</Button>
      </FormGroup>
    </MGDDisplayPane>
  );
};

export default DocSettings;
