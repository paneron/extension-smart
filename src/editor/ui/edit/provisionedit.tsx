import React from "react";
import { EditorModel } from "../../model/editormodel";
import { MMELObject } from "../../serialize/interface/baseinterface";
import { MMELProvision } from "../../serialize/interface/supportinterface";
import { referenceSorter } from "../../utils/commonfunctions";
import { MODAILITYOPTIONS } from "../../utils/constants";
import { MultiReferenceSelector, NormalComboBox, NormalTextField } from "../common/fields";
import { IObject } from "../common/listmanagement/listPopoverItem";

export function matchProvisionFilter(x: IObject, filter: string): boolean {
  const provision = x as MMELProvision;
  return (
    filter === '' ||    
    provision.condition.toLowerCase().indexOf(filter) !== -1
  );
}

export const ProvisonItem: React.FC<{
  object: MMELObject;
  model: EditorModel;
  setObject: (obj: MMELObject) => void;
}> = ({ object, model, setObject }) => {
  const provision = object as MMELProvision;
  
  const refs = Object.values(model.refs)
    .sort(referenceSorter)
    .map(r => r.id);

  return (
    <>
      <NormalTextField
        key="field#provisionText"
        text="Provision Text"
        value={provision.condition}
        onChange={(x: string) => {
          provision.condition = x;          
          setObject({ ...provision });
        }}
      />    
      <NormalComboBox
        key="field#provisionModality"
        text="Provision Modality"
        value={provision.modality}
        options={MODAILITYOPTIONS}
        onChange={(x: string) => {
          provision.modality = x;
          setObject({ ...provision });
        }}
      />
      <MultiReferenceSelector
        key="field#attributeReference"
        text="Reference"
        options={refs}
        values={provision.ref}
        filterName="Reference filter"
        add={x => {
          provision.ref = new Set([...provision.ref, ...x]);
          setObject({ ...provision });
        }}
        remove={x => {
          provision.ref = new Set([...provision.ref].filter(s => !x.has(s)));
          setObject({ ...provision });
        }}
      />
    </>
  );
};