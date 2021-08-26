import { Tooltip2 } from "@blueprintjs/popover2";
import React from "react";
import { MGDButtonType } from "../../../../css/MGDButton";
import MGDButton from "../../../MGDComponents/MGDButton";

export const RemoveButton: React.FC<{
  callback: () => void;
}> = function ({ callback }) {
  return (
    <Tooltip2 content="Remove Component">
      <MGDButton type={MGDButtonType.Primary} icon="cross" onClick={callback} />
    </Tooltip2>
  );
};

export const EditButton: React.FC<{
  callback: () => void;
}> = function ({ callback }) {
  return (
    <Tooltip2 content="Edit Component">
      <MGDButton icon="edit" onClick={callback} />;
    </Tooltip2>
  );
};