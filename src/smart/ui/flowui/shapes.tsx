import { SerializedStyles } from '@emotion/react';
import React from 'react';
import { RefObject } from 'react';
import { mgdLabel } from '../../../css/form';
import MGDProcessBox from '../../MGDComponents/MGDProcessBox';
import { ModelType } from '../../model/editormodel';
import {
  DragAndDropImportRefType,
  DragAndDropMappingType,
} from '../../utils/constants';

export const DatacubeShape: React.FC<{ color?: string }> = function ({
  color = 'none',
}) {
  return (
    <svg height="40" width="40">
      <polygon points="3,10 31,10 31,38, 3,38" fill={color} stroke="black" />
      <polygon points="3,10 31,10 39,2, 11,2" fill={color} stroke="black" />
      <polygon points="31,38 31,10 39,2, 39,30" fill={color} stroke="black" />
    </svg>
  );
};

export const StartShape: React.FC<{ color?: string }> = function ({
  color = 'none',
}) {
  return (
    <svg height="40" width="40">
      <circle
        cx="20"
        cy="21"
        r="18"
        stroke="black"
        strokeWidth="2"
        fill={color}
      />
    </svg>
  );
};

export const EndShape: React.FC<{ color?: string }> = function ({
  color = 'none',
}) {
  return (
    <svg height="40" width="40">
      <circle
        cx="20"
        cy="21"
        r="15"
        stroke="black"
        strokeWidth="5"
        fill={color}
      />
    </svg>
  );
};

export const TimerShape: React.FC<{ color?: string }> = function ({
  color = 'none',
}) {
  return (
    <svg height="40" width="40">
      <circle
        cx="20"
        cy="21"
        r="18"
        stroke="black"
        strokeWidth="2"
        fill={color}
      />
      <circle
        cx="20"
        cy="21"
        r="14"
        stroke="black"
        strokeWidth="2"
        fill={color}
      />
      <line x1="20" y1="21" x2="20" y2="11" stroke="black" strokeWidth="2" />
      <line x1="20" y1="21" x2="24" y2="27" stroke="black" strokeWidth="2" />
    </svg>
  );
};

export const EgateShape: React.FC<{ color?: string }> = function ({
  color = 'none',
}) {
  return (
    <svg height="40" width="40">
      <polygon
        points="2,21 20,3 38,21 20,39"
        fill={color}
        stroke="black"
        strokeWidth="2"
      />
    </svg>
  );
};

export const SignalCatchShape: React.FC<{ color?: string }> = function ({
  color = 'none',
}) {
  return (
    <svg height="40" width="40">
      <circle
        cx="20"
        cy="21"
        r="18"
        stroke="black"
        strokeWidth="2"
        fill={color}
      />
      <line x1="10" y1="31" x2="30" y2="31" stroke="black" strokeWidth="2" />
      <line x1="10" y1="31" x2="20" y2="11" stroke="black" strokeWidth="2" />
      <line x1="30" y1="31" x2="20" y2="11" stroke="black" strokeWidth="2" />
    </svg>
  );
};

interface Props {
  content: string;
  pid: string;
  styleClass?: SerializedStyles;
  setMapping?: (fromid: string, toid: string) => void;
  uiref?: RefObject<HTMLDivElement>;
}

export const ProcessBox: Record<
  ModelType,
  React.FC<Props>
> = {
  [ModelType.EDITREF] : ({ content, pid, styleClass }: Props) => (
    <MGDProcessBox
      styleClass={styleClass}
      draggable
      onDragStart={e => onImportDragStart(e, pid)}
    >
      {content}
    </MGDProcessBox>
  ),
  [ModelType.EDIT] : ({ content, styleClass }: Props) => (
    <MGDProcessBox styleClass={styleClass}>{content}</MGDProcessBox>
  ),
  [ModelType.IMP] : ({ content, pid, styleClass, uiref }: Props) => {
    return (
      <MGDProcessBox
        uiref={uiref}
        styleClass={styleClass}
        draggable
        onDragStart={event => onMapDragStart(event, pid)}
      >
        <label style={mgdLabel}>{content}</label>
      </MGDProcessBox>
    );
  },
  [ModelType.REF] : ({
    content,
    pid,
    styleClass,
    setMapping = () => {},
    uiref,
  }: Props) => (
    <MGDProcessBox
      uiref={uiref}
      styleClass={styleClass}
      onDrop={event => onMapDrop(event, pid, setMapping)}
    >
      <label style={mgdLabel}>{content}</label>
    </MGDProcessBox>
  ),
};

function onMapDragStart(event: React.DragEvent<unknown>, fromid: string): void {
  event.dataTransfer.setData(DragAndDropMappingType, fromid);
}

function onImportDragStart(
  event: React.DragEvent<unknown>,
  fromid: string
): void {
  event.dataTransfer.setData(DragAndDropImportRefType, fromid);
}

function onMapDrop(
  event: React.DragEvent<unknown>,
  toid: string,
  setMapping: (fromid: string, toid: string) => void
): void {
  const fromid = event.dataTransfer.getData(DragAndDropMappingType);
  setMapping(fromid, toid);
}
