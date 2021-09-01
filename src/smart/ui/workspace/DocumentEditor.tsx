/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { FormGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React from 'react';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
import {
  EditorDataClass,
  EditorModel,
  isEditorRegistry,
} from '../../model/editormodel';
import { SMARTDocument, SMARTDocumentStore } from '../../model/workspace';
import DCDocumentAttributes from './DCDocumentAttributes';

export type DocumentEditInterface = SMARTDocument & { regid: string };

const DocumentEdit: React.FC<{
  doc: DocumentEditInterface;
  model?: EditorModel;
  setDoc: (doc: DocumentEditInterface) => void;
  workspace: Record<string, SMARTDocumentStore>;
}> = function ({ doc, model, setDoc, workspace }) {
  const reg = model?.elements[doc.regid];
  if (reg !== undefined && model !== undefined && isEditorRegistry(reg)) {
    const dc = model.elements[reg.data] as EditorDataClass;
    return (
      <MGDDisplayPane>
        <FormGroup>
          <DCDocumentAttributes
            dc={dc}
            model={model}
            doc={doc}
            setDoc={doc => setDoc({ ...doc })}
            workspace={workspace}
            prefix=''
          />
        </FormGroup>
      </MGDDisplayPane>
    );
  }
  return <></>;
};

export default DocumentEdit;
