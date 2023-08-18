import { Button, Checkbox, Dialog, Text } from '@blueprintjs/core';
import React, { useEffect } from 'react';
import { useMemo, useState } from 'react';
import { dialogLayout, dialogLayoutFull } from '@/css/layout';
import MGDSidebar from '@/smart/MGDComponents/MGDSidebar';
import type {
  EditorModel,
  EditorProcess } from '@/smart/model/editormodel';
import {
  isEditorProcess,
} from '@/smart/model/editormodel';
import type {
  MMELProvision,
  MMELReference,
  MMELRole,
} from '@paneron/libmmel/interface/supportinterface';
import type { ModalityType } from '@/smart/utils/constants';
import { MODAILITYOPTIONS } from '@/smart/utils/constants';
import { clauseSorter } from '@/smart/utils/ModelFunctions';
import { NormalComboBox } from '@/smart/ui/common/fields';
import ProvisionSummary from '@/smart/ui/summary/ProvisionSummary';

export interface ClauseSummary {
  title: string;
  provisions: ProvisionRecord[];
}

export interface ProvisionRecord {
  actor: MMELRole | undefined;
  statement: MMELProvision;
}

const ModalityText: Record<ModalityType, string> = {
  ''       : 'Not specified (empty)',
  'CAN'    : 'CAN',
  'MAY'    : 'MAY',
  'MUST'   : 'MUST',
  'SHALL'  : 'SHALL',
  'SHOULD' : 'SHOULD',
};

const ProvisionSettings: React.FC<{
  model: EditorModel;
}> = function ({ model }) {
  const [result, setResult] = useState<
    Record<string, Record<string, ClauseSummary>> | undefined
  >(undefined);
  const [docOption, setDocOption] = useState<string>('');
  const [clauseOption, setClauseOption] = useState<string>('');
  const [actorOption, setActorOption] = useState<string>('');
  const [modalityOption, setModalityOption] = useState<
    Record<ModalityType, boolean>
  >({
    ''       : true,
    'CAN'    : true,
    'MAY'    : true,
    'MUST'   : true,
    'SHALL'  : true,
    'SHOULD' : true,
  });
  const docs = useMemo(() => {
    const docs: Record<string, Record<string, ClauseSummary>> = {};
    Object.values(model.refs).forEach(r =>
      addToDoc(docs, r.document, r.clause, r.title)
    );
    Object.values(model.elements)
      .filter(x => isEditorProcess(x))
      .forEach(x => {
        const process = x as EditorProcess;
        const actor =
          process.actor !== '' ? model.roles[process.actor] : undefined;
        process.provision.forEach(p => {
          const prov = model.provisions[p];
          prov.ref.forEach(r => {
            addProvisionToDoc(docs, model.refs[r], prov, actor);
          });
        });
      });
    return docs;
  }, [model]);

  const actorList = useMemo(
    () => ['', ...Object.values(model.roles).map(r => r.id)],
    [model]
  );

  const docList = ['', ...Object.keys(docs)];
  const clauseList =
    docOption !== ''
      ? ['', ...Object.keys(docs[docOption] ?? {}).sort(clauseSorter)]
      : [];

  function flip(opt: ModalityType) {
    setModalityOption({ ...modalityOption, [opt] : !modalityOption[opt] });
  }

  function calculateResult() {
    const result: Record<string, Record<string, ClauseSummary>> = {};
    Object.entries(docs).forEach(([doc, record]) => {
      if (docOption === '' || doc === docOption) {
        const filterRecord: Record<string, ClauseSummary> = {};
        Object.entries(record).forEach(([clause, summary]) => {
          if (
            clauseOption === '' ||
            clause.substring(
              0,
              Math.min(clauseOption.length, clause.length)
            ) === clauseOption
          ) {
            const filterSummary: ProvisionRecord[] = [];
            for (const sum of summary.provisions) {
              const modality = sum.statement.modality;
              if (
                modalityOption[modality as ModalityType] &&
                (actorOption === '' || sum.actor?.id === actorOption)
              ) {
                filterSummary.push(sum);
              }
            }
            if (filterSummary.length > 0) {
              filterRecord[clause] = { ...summary, provisions : filterSummary };
            }
          }
        });
        if (Object.keys(filterRecord).length > 0) {
          result[doc] = filterRecord;
        }
      }
    });
    setResult(result);
  }
  function cleanup() {
    setDocOption('');
    setClauseOption('');
    setActorOption('');
    setModalityOption({
      ''       : true,
      'CAN'    : true,
      'MAY'    : true,
      'MUST'   : true,
      'SHALL'  : true,
      'SHOULD' : true,
    });
  }

  useEffect(() => cleanup, [model]);

  return (
    <MGDSidebar>
      <Text>Reference document filter:</Text>
      {docList.length > 1 ? (
        <>
          <NormalComboBox
            text="Select document filter"
            value={docOption}
            options={docList}
            onChange={x => {
              setDocOption(x);
              setClauseOption('');
            }}
          />
          {docOption !== '' && (
            <>
              <Text>Clause filter:</Text>
              {clauseList.length > 1 ? (
                <NormalComboBox
                  text="Select clause filter"
                  value={clauseOption}
                  options={clauseList}
                  onChange={x => setClauseOption(x)}
                />
              ) : (
                <Text>No clause is found in the document </Text>
              )}
            </>
          )}
        </>
      ) : (
        <Text>No reference is found in the model</Text>
      )}
      <NormalComboBox
        text="Actor filter"
        value={actorOption}
        options={actorList}
        onChange={x => setActorOption(x)}
      />
      <Text>Modality filter</Text>
      {MODAILITYOPTIONS.map(opt => (
        <Checkbox
          key={`Option${opt}`}
          checked={modalityOption[opt]}
          label={ModalityText[opt]}
          onChange={() => flip(opt)}
        />
      ))}
      <Dialog
        isOpen={result !== undefined}
        title="Provision summary"
        style={{ ...dialogLayout, ...dialogLayoutFull }}
        onClose={() => setResult(undefined)}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
      >
        {result !== undefined ? <ProvisionSummary result={result} /> : <></>}
      </Dialog>
      <Button onClick={calculateResult}>Generate summary</Button>
    </MGDSidebar>
  );
};

function addToDoc(
  docs: Record<string, Record<string, ClauseSummary>>,
  document: string,
  clause: string,
  title: string
) {
  let doc = docs[document];
  if (doc === undefined) {
    doc = {};
    docs[document] = doc;
  }
  let c = doc[clause];
  if (c === undefined) {
    c = { title, provisions : []};
    doc[clause] = c;
  }
}

function addProvisionToDoc(
  docs: Record<string, Record<string, ClauseSummary>>,
  ref: MMELReference,
  provision: MMELProvision,
  actor: MMELRole | undefined
) {
  const record = docs[ref.document][ref.clause];
  record.provisions.push({ actor, statement : provision });
}

export default ProvisionSettings;
