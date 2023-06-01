import React from 'react';
import { EditorApproval } from '@/smart/model/editormodel';
import { DescriptionItem } from '@/smart/ui/common/description/fields';

const ApprovalSummary: React.FC<{
  approval: EditorApproval;
}> = function ({ approval }) {
  return (
    <>
      <DescriptionItem label="ID" value={approval.id} />
      <DescriptionItem label="Name" value={approval.name} />
    </>
  );
};

export default ApprovalSummary;
