import { Button, ButtonGroup, HTMLTable } from '@blueprintjs/core';
import { Classes } from '@blueprintjs/popover2';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React from 'react';
import { CSSProperties, useContext, useState } from 'react';
import MGDContainer from '@/smart/MGDComponents/MGDContainer';
import MGDDisplayPane from '@/smart/MGDComponents/MGDDisplayPane';
import { ViewFunctionInterface } from '@/smart/model/ViewFunctionModel';
import { FILE_TYPE, saveToFileSystem } from '@/smart/utils/IOFunctions';
import { NormalComboBox } from '@/smart/ui/common/fields';
import updateMeasurementView from '@/smart/ui/measurement/MeasurementResultFormatter';
import { Log27001, Log27001Record } from '@/smart/ui/application/ISO27001/model';

const options = ['No filter', 'Pass', 'Fail'] as const;
type ResultType = typeof options[number];

const centerAlign: CSSProperties = {
  textAlign     : 'center',
  verticalAlign : 'middle',
};

const Application27001LogPage: React.FC<{
  setView: (view: ViewFunctionInterface) => void;
  logs: Log27001;
  clearAlert?: () => void;
}> = function ({ setView, logs, clearAlert }) {
  const { getBlob, writeFileToFilesystem } = useContext(DatasetContext);

  const [resultFilter, setResultFilter] = useState<ResultType>(options[0]);

  const requirePass = resultFilter === options[1];

  const records = logs.records;
  const showRec: Log27001Record[] = [];
  for (let i = records.length - 1; i >= 0 && showRec.length < 10; i--) {
    const r = records[i];
    if (resultFilter === options[0] || requirePass === r.result.overall) {
      showRec.push(records[i]);
    }
  }

  async function onSave(log: Log27001Record) {
    const fileData = JSON.stringify(log, undefined, 2);

    await saveToFileSystem({
      getBlob,
      writeFileToFilesystem,
      fileData,
      type : FILE_TYPE.JSON,
    });
  }

  return (
    <MGDDisplayPane isBSI={false}>
      <MGDContainer>
        <HTMLTable
          bordered
          interactive
          striped
          condensed
          style={{
            fontSize : 14,
          }}
        >
          <thead>
            <tr>
              <th>Time</th>
              <th>Result</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td></td>
              <td style={centerAlign}>
                <NormalComboBox
                  options={options}
                  value={resultFilter}
                  onChange={x => setResultFilter(x as ResultType)}
                  noContainer
                />
              </td>
              <td></td>
            </tr>
            {showRec.map((r, index) => (
              <tr key={`tablerow#${index}`}>
                <td style={centerAlign}>{r.time.toUTCString()}</td>
                <td style={centerAlign}>
                  <Button
                    active
                    large
                    fill
                    intent={r.result.overall ? 'success' : 'danger'}
                  >
                    {r.result.overall ? 'Pass' : 'Fail'}
                  </Button>
                </td>
                <td style={centerAlign}>
                  <ButtonGroup>
                    <Button
                      className={Classes.POPOVER2_DISMISS}
                      intent="primary"
                      onClick={() => updateMeasurementView(r.result, setView)}
                    >
                      View
                    </Button>
                    <Button onClick={() => onSave(r)}>Raw Data</Button>
                  </ButtonGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </MGDContainer>
      {clearAlert !== undefined && (
        <MGDContainer>
          <Button intent="warning" onClick={clearAlert}>
            Clear Alert
          </Button>
        </MGDContainer>
      )}
    </MGDDisplayPane>
  );
};

export default Application27001LogPage;
