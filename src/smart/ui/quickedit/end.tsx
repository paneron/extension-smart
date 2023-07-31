import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import { EditorEndEvent } from '@/smart/model/editormodel';
import { DataType } from '@paneron/libmmel/interface/baseinterface';
import { EditAction } from '@/smart/utils/constants';
import { DescribeEnd } from '@/smart/ui/common/description/ComponentDescription';
import { DialogSetterInterface } from '@/smart/ui/dialog/EditorDialogs';
import { EditPageButtons } from '@/smart/ui/edit/commons';

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
