import React from "react";
import { EditorModel, EditorProcess } from "../../../model/editormodel";
import { ProvisionList } from "../../common/description/ComponentList";
import { DescriptionItem } from "../../common/description/fields";

const ProcessSummary:React.FC<{
  process: EditorProcess;
  model: EditorModel;
}> = function ({ process, model }) {
  return (
    <>
      <DescriptionItem label="ID" value={process.id} />
      <DescriptionItem label="Name" value={process.name} />
      <ProvisionList        
        provisions={process.provision}
        getProvisionById={id => model.provisions[id]}        
      />
    </>
  );
}

export default ProcessSummary;