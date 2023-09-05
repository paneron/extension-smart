import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import MGDDisplayPane from '@/smart/MGDComponents/MGDDisplayPane';
import type {
  EditorDataClass,
  EditorModel } from '@/smart/model/editormodel';
import {
  isEditorRegistry,
} from '@/smart/model/editormodel';
import type { SMARTDocument, SMARTDocumentStore } from '@/smart/model/workspace';
import DCDocumentAttributes from '@/smart/ui/workspace/DCDocumentAttributes';

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
            prefix=""
          />
        </FormGroup>
      </MGDDisplayPane>
    );
  }
  return <></>;
};

export default DocumentEdit;
