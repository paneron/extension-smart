import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import { EditorEndEvent } from '../../model/editormodel';
import { DataType } from '../../serialize/interface/baseinterface';
import { EditAction } from '../../utils/constants';
import { DescribeEnd } from '../common/description/ComponentDescription';
import { DialogSetterInterface } from '../dialog/EditorDialogs';
import { EditPageButtons } from '../edit/commons';

const QuickEditEnd: React.FC<{
  end: EditorEndEvent;
  setDialog: DialogSetterInterface;
}> = props => {
  const { end, setDialog } = props;

  function onDeleteClick() {
    setDialog(DataType.ENDEVENT, EditAction.DELETE, end.id);
  }

  return (
    <FormGroup>
      <EditPageButtons onDeleteClick={onDeleteClick} />
      <DescribeEnd />
    </FormGroup>
  );
};

export default QuickEditEnd;
