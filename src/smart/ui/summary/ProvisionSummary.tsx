/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button, ButtonGroup, Text } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React, { useContext } from 'react';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
import { FILE_TYPE, saveToFileSystem } from '../../utils/IOFunctions';
import { clauseSorter } from '../../utils/ModelFunctions';
import translateObjectToXML from '../../utils/XMLWriter';
import { ClauseSummary } from './ProvisionSettings';

const ProvisionSummary: React.FC<{
  result: Record<string, Record<string, ClauseSummary>>;
}> = function ({ result }) {
  const { getBlob, writeFileToFilesystem } = useContext(DatasetContext);
  const entries = Object.entries(result);

  async function onSave(fileData: string, fileType: FILE_TYPE) {
    await saveToFileSystem({
      getBlob,
      writeFileToFilesystem,
      fileData,
      type: fileType,
    });
  }

  return (
    <MGDDisplayPane>
      {entries.length > 0 ? (
        <>
          <ButtonGroup>
            <Button
              onClick={() => onSave(JSON.stringify(result), FILE_TYPE.JSON)}
            >
              {' '}
              Export to JSON{' '}
            </Button>
            <Button
              onClick={() =>
                onSave(translateObjectToXML(result), FILE_TYPE.XML)
              }
            >
              {' '}
              Export to XML{' '}
            </Button>
            <Button onClick={() => onSave(resultToCSV(result), FILE_TYPE.CSV)}>
              {' '}
              Export to CSV{' '}
            </Button>
          </ButtonGroup>
          {entries.map(([doc, record]) => (
            <DocumentSummary key={doc} doc={doc} record={record} />
          ))}
        </>
      ) : (
        <Text>No result</Text>
      )}
    </MGDDisplayPane>
  );
};

const DocumentSummary: React.FC<{
  doc: string;
  record: Record<string, ClauseSummary>;
}> = function ({ doc, record }) {
  return (
    <>
      <h1>{doc}</h1>
      <fieldset>
        <legend>Clauses</legend>
        {Object.entries(record)
          .sort(([c1], [c2]) => clauseSorter(c1, c2))
          .map(([clause, summary]) => (
            <ClauseSummary key={clause} clause={clause} summary={summary} />
          ))}
      </fieldset>
    </>
  );
};

const ClauseSummary: React.FC<{
  clause: string;
  summary: ClauseSummary;
}> = function ({ clause, summary }) {
  const { provisions, actor } = summary;
  return (
    <>
      <h3>
        {clause}
        {summary.title !== '' && ` ${summary.title}`}
      </h3>
      {provisions.length > 0 && (
        <ul>
          {provisions.map(p => (
            <li key={p.id}>
              {actor !== undefined && `[Actor: ${actor.name}]`}
              {p.modality !== '' && `[Modality: ${p.modality}]`}
              {`[Statement: ${p.condition}]`}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

function resultToCSV(
  result: Record<string, Record<string, ClauseSummary>>
): string {
  let out =
    [
      'Document',
      'Clause',
      'Clause title',
      'Actor',
      'Modality',
      'Statement',
    ].join(',') + '\n';
  for (const [document, record] of Object.entries(result)) {
    for (const [clause, summary] of Object.entries(record)) {
      for (const p of summary.provisions) {
        out +=
          [
            document,
            clause,
            summary.title,
            summary.actor !== undefined ? summary.actor.name : '',
            p.modality,
            `"${p.condition}"`,
          ].join(',') + '\n';
      }
    }
  }
  return out;
}

export default ProvisionSummary;
