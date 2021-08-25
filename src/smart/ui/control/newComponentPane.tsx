/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import React from 'react';
import { mgd_label } from '../../../css/form';
import MGDComponentBar from '../../MGDComponents/MGDComponentBar';
import MGDProcessBox from '../../MGDComponents/MGDProcessBox';
import { DataType } from '../../serialize/interface/baseinterface';
import {
  DragAndDropFormatType,
  NewComponentTypes,
} from '../../utils/constants';
import {
  EgateShape,
  EndShape,
  SignalCatchShape,
  TimerShape,
} from '../flowui/shapes';

const NewComponentPane: React.FC = function () {
  return (
    <MGDComponentBar>
      <Unit>
        <MGDProcessBox
          onDragStart={event => onDragStart(event, DataType.PROCESS)}
          draggable
        >
          <label css={mgd_label}> Process </label>
        </MGDProcessBox>
      </Unit>
      <Unit>
        <MGDProcessBox
          onDragStart={event => onDragStart(event, DataType.APPROVAL)}
          draggable
        >
          <label css={mgd_label}> Approval </label>
        </MGDProcessBox>
      </Unit>
      <Unit>
        <span
          onDragStart={event => onDragStart(event, DataType.ENDEVENT)}
          draggable
        >
          <EndShape />
        </span>
      </Unit>
      <Unit>
        <span
          onDragStart={event => onDragStart(event, DataType.TIMEREVENT)}
          draggable
        >
          <TimerShape />
        </span>
      </Unit>
      <Unit>
        <span
          onDragStart={event => onDragStart(event, DataType.SIGNALCATCHEVENT)}
          draggable
        >
          <SignalCatchShape />
        </span>
      </Unit>
      <Unit>
        <span
          onDragStart={event => onDragStart(event, DataType.EGATE)}
          draggable
        >
          <EgateShape />
        </span>
      </Unit>
    </MGDComponentBar>
  );
};

function onDragStart(
  event: React.DragEvent<HTMLElement>,
  msg: NewComponentTypes
) {
  if (event.dataTransfer !== null) {
    event.dataTransfer.setData(DragAndDropFormatType, msg);
    event.dataTransfer.effectAllowed = 'move';
  }
}

const Unit = styled.div`
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default NewComponentPane;
