/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button, FormGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import { useMemo } from 'react';
import { EditorModel } from '../../../model/editormodel';
import { ProvisionSelection } from '../../../model/provisionImport';
import { DataType } from '../../../serialize/interface/baseinterface';
import {
  MMELProvision,
  MMELReference,
} from '../../../serialize/interface/supportinterface';
import { MODAILITYOPTIONS, ModalityType } from '../../../utils/constants';
import { createProvision } from '../../../utils/EditorFactory';
import {
  findUniqueID,
  getModelAllRefs,
  trydefaultID,
} from '../../../utils/ModelFunctions';
import { findExistingRef } from '../../../utils/ModelImport';
import { NormalComboBox, NormalTextField } from '../../common/fields';
import SimpleReferenceSelector from './ReferenceSelector';

const ProvisionListQuickEdit: React.FC<{
  provisions: Record<string, MMELProvision>;
  setProvisions: (x: Record<string, MMELProvision>) => void;
  model: EditorModel;
  selected?: ProvisionSelection;
  onAddReference: (refs: Record<string, MMELReference>) => void;
}> = function ({ provisions, setProvisions, model, selected, onAddReference }) {
  const refs = useMemo(() => getModelAllRefs(model), [model]);

  function addProvision() {
    const id = findUniqueID('Provision', provisions);
    provisions[id] = createProvision(id);
    setProvisions({ ...provisions });
  }

  function onImport() {
    if (selected !== undefined) {
      const ref: MMELReference = {
        id: '',
        title: '',
        clause: selected.clause,
        document: selected.doc,
        datatype: DataType.REFERENCE,
      };
      const existing = findExistingRef(model, ref, false);
      const refid =
        existing !== null
          ? existing.id
          : trydefaultID(
              `${selected.namespace}-ref${selected.clause.replaceAll(
                '.',
                '-'
              )}`,
              model.refs
            );
      if (existing === null) {
        onAddReference({ ...model.refs, [refid]: { ...ref, id: refid } });
      }

      const id = findUniqueID('Provision', provisions);
      provisions[id] = {
        subject: {},
        id,
        modality: detectModality(selected.text),
        condition: selected.text,
        ref: new Set<string>([refid]),
        datatype: DataType.PROVISION,
      };
      setProvisions({ ...provisions });
    }
  }

  return (
    <FormGroup label="Provisions">
      {selected !== undefined && (
        <div
          style={{
            width: '100%',
            marginBottom: '15px',
            textAlign: 'center',
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
            provisions[index] = x;
            setProvisions({ ...provisions });
          }}
          onDelete={() => {
            delete provisions[index];
            setProvisions({ ...provisions });
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
        position: 'relative',
      }}
    >
      <fieldset>
        <NormalTextField
          text="Provision Text"
          value={provision.condition}
          onChange={x => setProvision({ ...provision, condition: x })}
        />
        <NormalComboBox
          text="Provision Modality"
          value={provision.modality}
          options={MODAILITYOPTIONS}
          onChange={x => setProvision({ ...provision, modality: x })}
        />
        <SimpleReferenceSelector
          selected={provision.ref}
          items={refs}
          onItemSelect={x =>
            setProvision({
              ...provision,
              ref: new Set([...provision.ref, x.id]),
            })
          }
          onTagRemove={x => {
            provision.ref = new Set([...provision.ref].filter(s => x !== s));
            setProvision({ ...provision });
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: -8,
            zIndex: 10,
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

interface ModOption {
  lowerCaseText: string;
  modality: ModalityType;
}

function detectModality(text: string): ModalityType {
  const options: ModOption[] = [...MODAILITYOPTIONS]
    .map(x => ({
      lowerCaseText: x.toLowerCase(),
      modality: x,
    }))
    .sort((a, b) => b.modality.length - a.modality.length);
  const t = text.toLowerCase();
  for (const m of options) {
    if (t.includes(m.lowerCaseText)) {
      return m.modality;
    }
  }
  return '';
}

export default ProvisionListQuickEdit;
