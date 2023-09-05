import { Button, FormGroup } from '@blueprintjs/core';
import React, { useState } from 'react';
import MGDDisplayPane from '@/smart/MGDComponents/MGDDisplayPane';
import type { MMELDocument } from '@/smart/model/document';
import { plainToDoc } from '@/smart/utils/DocumentFunctions';
import { NormalTextField } from '@/smart/ui/common/fields';

const DocImport: React.FC<{
  setDoc: (x: MMELDocument) => void;
  done: () => void;
}> = function ({ setDoc, done }) {
  const [data, setData] = useState<string>('');
  const [ns, setNS] = useState<string>('');

  function processImport() {
    const doc = plainToDoc(data);
    doc.id = ns;
    setDoc(doc);
    done();
  }

  return (
    <MGDDisplayPane>
      <FormGroup>
        <NormalTextField text="Namespace" value={ns} onChange={x => setNS(x)} />
        <NormalTextField
          text="Import content"
          value={data}
          onChange={x => setData(x)}
          rows={30}
        />
        <Button onClick={processImport}>Done</Button>
      </FormGroup>
    </MGDDisplayPane>
  );
};

export default DocImport;
