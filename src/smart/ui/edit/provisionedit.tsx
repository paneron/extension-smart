import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import type { EditorModel } from '@/smart/model/editormodel';
import type { MMELProvision } from '@paneron/libmmel/interface/supportinterface';
import { getModelAllRefs } from '@/smart/utils/ModelFunctions';
import { MODAILITYOPTIONS } from '@/smart/utils/constants';
import {
  MultiReferenceSelector,
  NormalComboBox,
  NormalTextField,
} from '@/smart/ui/common/fields';
import type { IMMELObject } from '@/smart/ui/common/listmanagement/listPopoverItem';

export function matchProvisionFilter(x: IMMELObject, filter: string): boolean {
  const provision = x as MMELProvision;
  return filter === '' || provision.condition.toLowerCase().includes(filter);
}

export const ProvisonItem: React.FC<{
  object: MMELProvision;
  model?: EditorModel;
  setObject: (obj: MMELProvision) => void;
}> = ({ object: provision, model, setObject: setProvision }) => {
  const refs = getModelAllRefs(model!).map(r => r.id);

  return (
    <FormGroup>
      <NormalTextField
        text="Provision Text"
        value={provision.condition}
        onChange={x => setProvision({ ...provision, condition : x })}
      />
      <NormalComboBox
        text="Provision Modality"
        value={provision.modality}
        options={MODAILITYOPTIONS}
        onChange={x => setProvision({ ...provision, modality : x })}
      />
      <MultiReferenceSelector
        text="Reference"
        options={refs}
        values={provision.ref}
        filterName="Reference filter"
        add={x => {
          provision.ref = new Set([...provision.ref, ...x]);
          setProvision({ ...provision });
        }}
        remove={x => {
          provision.ref = new Set([...provision.ref].filter(s => !x.has(s)));
          setProvision({ ...provision });
        }}
      />
    </FormGroup>
  );
};
