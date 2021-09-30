/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { FormGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React from 'react';
import { EditorEndEvent } from '../../model/editormodel';
import { DataType } from '../../serialize/interface/baseinterface';
import {
  DeletableNodeTypes,
  EditableNodeTypes,
  EditAction,
} from '../../utils/constants';
import { DescribeEnd } from '../common/description/ComponentDescription';
import { EditPageButtons } from '../edit/commons';

const QuickEditEnd: React.FC<{
  end: EditorEndEvent;
  setDialog: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string
  ) => void;
}> = props => {
  const { end, setDialog } = props;

  function onDeleteClick() {
    setDialog(DataType.ENDEVENT, EditAction.DELETE, end.id);
  }

  const functionProps = { onDeleteClick };

  return (
    <FormGroup>
      <EditPageButtons {...functionProps} />
      <DescribeEnd />
    </FormGroup>
  );
};

export default QuickEditEnd;
