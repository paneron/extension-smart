import React from "react";
import { EditorSignalEvent, EditorTimerEvent } from "../../../model/editormodel";
import { DescriptionItem } from "../../common/description/fields";

export const TimerSummary:React.FC<{
  timer: EditorTimerEvent;  
}> = function ({ timer }) {
  return (
    <>
      <DescriptionItem label="ID" value={timer.id} />      
      <DescriptionItem label="Type" value={timer.type} />
      <DescriptionItem label="Parameter" value={timer.para} />
    </>
  );
}

export const SignalSummary:React.FC<{
  signal: EditorSignalEvent;  
}> = function ({ signal }) {
  return (
    <>
      <DescriptionItem label="ID" value={signal.id} />      
      <DescriptionItem label="Signal" value={signal.signal} />
    </>
  );
}