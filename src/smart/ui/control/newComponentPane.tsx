/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { mgd_label } from '../../../css/form';
import MGDComponentBar from '../../MGDComponents/MGDComponentBar';
import MGDContainer from '../../MGDComponents/MGDContainer';
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
      <MGDContainer>
        <MGDProcessBox
          onDragStart={event => onDragStart(event, DataType.PROCESS)}
          draggable
        >
          <label css={mgd_label}> Process </label>
        </MGDProcessBox>
      </MGDContainer>
      <MGDContainer>
        <MGDProcessBox
          onDragStart={event => onDragStart(event, DataType.APPROVAL)}
          draggable
        >
          <label css={mgd_label}> Approval </label>
        </MGDProcessBox>
      </MGDContainer>
      <MGDContainer>
        <span
          onDragStart={event => onDragStart(event, DataType.ENDEVENT)}
          draggable
        >
          <EndShape />
        </span>
      </MGDContainer>
      <MGDContainer>
        <span
          onDragStart={event => onDragStart(event, DataType.TIMEREVENT)}
          draggable
        >
          <TimerShape />
        </span>
      </MGDContainer>
      <MGDContainer>
        <span
          onDragStart={event => onDragStart(event, DataType.SIGNALCATCHEVENT)}
          draggable
        >
          <SignalCatchShape />
        </span>
      </MGDContainer>
      <MGDContainer>
        <span
          onDragStart={event => onDragStart(event, DataType.EGATE)}
          draggable
        >
          <EgateShape />
        </span>
      </MGDContainer>
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

export default NewComponentPane;
