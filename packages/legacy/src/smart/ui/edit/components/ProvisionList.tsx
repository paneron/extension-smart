import { Button, FormGroup } from '@blueprintjs/core';
import React from 'react';
import { useMemo } from 'react';
import { EditorModel } from '@/smart/model/editormodel';
import { RefTextSelection } from '@/smart/model/selectionImport';
import { DataType } from '@paneron/libmmel/interface/baseinterface';
import {
  MMELProvision,
  MMELReference,
} from '@paneron/libmmel/interface/supportinterface';
import { MODAILITYOPTIONS, ModalityType } from '@/smart/utils/constants';
import { createProvision } from '@/smart/utils/EditorFactory';
import {
  findUniqueID,
  getModelAllRefs,
  trydefaultID,
} from '../../../utils/ModelFunctions';
import { findExistingRef } from '@/smart/utils/ModelImport';
import { NormalComboBox, NormalTextField } from '@/smart/ui/common/fields';
import SimpleReferenceSelector from '@/smart/ui/edit/components/ReferenceSelector';

const ProvisionListQuickEdit: React.FC<{
  provisions: Record<string, MMELProvision>;
  setProvisions: (x: Record<string, MMELProvision>) => void;
  model: EditorModel;
  selected?: RefTextSelection;
  onAddReference: (refs: MMELReference[]) => void;
}> = function ({ provisions, setProvisions, model, selected, onAddReference }) {
  const refs = useMemo(() => getModelAllRefs(model), [model]);

  function addProvision() {
    const id = findUniqueID('Provision', provisions);
    setProvisions({ ...provisions, [id] : createProvision(id) });
  }

  function onImport() {
    if (selected) {
      const ref: MMELReference = {
        id       : '',
        title    : selected.clauseTitle,
        clause   : selected.clause,
        document : selected.doc,
        datatype : DataType.REFERENCE,
      };
      const existing = findExistingRef(model, ref, false);
      ref.id = existing
        ? existing.id
        : trydefaultID(
          `${selected.namespace}-ref${selected.clause.replaceAll('.', '-')}`,
          model.refs
        );
      const id = findUniqueID('Provision', provisions);
      const newPro: MMELProvision = {
        id,
        modality  : detectModality(selected.text),
        condition : selected.text,
        ref       : new Set<string>([ref.id]),
        datatype  : DataType.PROVISION,
      };
      setProvisions({ ...provisions, [id] : newPro });
      if (existing === null) {
        onAddReference([ref]);
      }
    }
  }

  return (
    <FormGroup label="Provisions">
      {selected !== undefined && (
        <div
          style={{
            width        : '100%',
            marginBottom : '15px',
            textAlign    : 'center',
          }}
        >
          <Button intent="primary" onClick={onImport}>
            Import from selection
          </Button>
        </div>
      )}

      {Object.entries(provisions).map(([index, p]) => (
        <ProvisionQuickEdit
          key={index}
          provision={p}
          refs={refs}
          setProvision={x => {
            setProvisions({ ...provisions, [index] : x });
          }}
          onDelete={() => {
            const newProvisions = { ...provisions };
            delete newProvisions[index];
            setProvisions(newProvisions);
          }}
        />
      ))}
      <Button icon="plus" onClick={addProvision}>
        Add provision
      </Button>
    </FormGroup>
  );
};

const ProvisionQuickEdit: React.FC<{
  provision: MMELProvision;
  setProvision: (x: MMELProvision) => void;
  refs: MMELReference[];
  onDelete: () => void;
}> = function ({ provision, setProvision, refs, onDelete }) {
  return (
    <div
      style={{
        position : 'relative',
      }}
    >
      <fieldset>
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
        <SimpleReferenceSelector
          selected={provision.ref}
          items={refs}
          onItemSelect={x =>
            setProvision({
              ...provision,
              ref : new Set([...provision.ref, x.id]),
            })
          }
          onTagRemove={x => {
            setProvision({
              ...provision,
              ref : new Set([...provision.ref].filter(s => x !== s)),
            });
          }}
        />
        <div
          style={{
            position : 'absolute',
            right    : 0,
            top      : -8,
            zIndex   : 10,
          }}
        >
          <Button intent="danger" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </fieldset>
    </div>
  );
};

export interface ModOption {
  lowerCaseText: string;
  modality: ModalityType;
}

const options: ModOption[] = MODAILITYOPTIONS.map(x => ({
  lowerCaseText : x.toLowerCase(),
  modality      : x,
})).sort((a, b) => b.modality.length - a.modality.length);

export function detectModality(text: string): ModalityType {
  const t = text.toLowerCase();
  for (const m of options) {
    if (t.includes(m.lowerCaseText)) {
      return m.modality;
    }
  }
  return '';
}

export default ProvisionListQuickEdit;
