/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import React from 'react';
import { DataType } from '../../serialize/interface/baseinterface';
import {
  DragAndDropFormatType,
  NewComponentTypes,
} from '../../utils/constants';
import {
  EgateShape,
  EndShape,
  InternalProcessBox,
  SignalCatchShape,
  TimerShape,
} from '../flowui/shapes';

const NewComponentPane: React.FC = function () {
  return (
    <>
      <Unit>
        <InternalProcessBox
          onDragStart={event => onDragStart(event, DataType.PROCESS)}
          draggable
        >
          {' '}
          Process
        </InternalProcessBox>
      </Unit>
      <Unit>
        <InternalProcessBox
          onDragStart={event => onDragStart(event, DataType.APPROVAL)}
          draggable
        >
          {' '}
          Approval
        </InternalProcessBox>
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
    </>
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
