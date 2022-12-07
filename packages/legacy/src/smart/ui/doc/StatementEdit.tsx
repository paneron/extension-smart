import React from 'react';
import { DocStatement } from '../../model/document';

const StatementEdit: React.FC<{
  statement: DocStatement;
  showSection?: string;
  first: boolean;
  isHeader: boolean;
}> = function ({ statement, showSection, first, isHeader }) {
  const content =
    (showSection !== undefined ? `${showSection}. ` : '') + statement.text;

  return isHeader ? (
    <div style={{ textAlign : 'center' }}>
      <h4>{statement.text}</h4>
    </div>
  ) : (
    <>
      <span
        style={{
          marginLeft : first ? '0' : '3px',
        }}
        ref={statement.uiref}
      >
        {content}
      </span>
    </>
  );
};

export default StatementEdit;
