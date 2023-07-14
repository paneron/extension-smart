import React from 'react';
import { mgdLabel } from '@/css/form';
import MGDComponentBar from '@/smart/MGDComponents/MGDComponentBar';
import MGDContainer from '@/smart/MGDComponents/MGDContainer';
import MGDProcessBox from '@/smart/MGDComponents/MGDProcessBox';
import { DataType } from '@paneron/libmmel/interface/baseinterface';
import {
  DragAndDropNewFormatType,
  NewComponentTypes,
} from '@/smart/utils/constants';
import {
  EgateShape,
  EndShape,
  SignalCatchShape,
  TimerShape,
} from '@/smart/ui/flowui/shapes';

/**
 * It is the UI shown on the sidebar for adding new elements to the diagram
 */

const NewComponentPane: React.FC = function () {
  return (
    <MGDComponentBar>
      <MGDContainer>
        <MGDProcessBox
          onDragStart={event => onDragStart(event, DataType.PROCESS)}
          draggable
        >
          <label style={mgdLabel}> Process </label>
        </MGDProcessBox>
      </MGDContainer>
      <MGDContainer>
        <MGDProcessBox
          onDragStart={event => onDragStart(event, DataType.APPROVAL)}
          draggable
        >
          <label style={mgdLabel}> Approval </label>
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
    event.dataTransfer.setData(DragAndDropNewFormatType, msg);
    event.dataTransfer.effectAllowed = 'move';
  }
}

export default NewComponentPane;
