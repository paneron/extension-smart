import React from 'react';
import { EditorEGate } from '@/smart/model/editormodel';
import { DescriptionItem } from '@/smart/ui/common/description/fields';

const EGateSummary: React.FC<{
  egate: EditorEGate;
}> = function ({ egate }) {
  return (
    <>
      <DescriptionItem label="ID" value={egate.id} />
      <DescriptionItem label="Contents" value={egate.label} />
    </>
  );
};

export default EGateSummary;
