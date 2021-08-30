import React from 'react';
import { EditorApproval } from '../../../model/editormodel';
import { DescriptionItem } from '../../common/description/fields';

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
