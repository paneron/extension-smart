import {
  Text,
  Button,
  ButtonGroup,
  Dialog,
  IToastProps,
} from '@blueprintjs/core';
import { useEffect, useMemo, useState } from 'react';
import {
  applicationDialogLayout,
  dialogLayout,
  dialogLayoutFull,
} from '../../../../css/layout';
import MGDContainer from '../../../MGDComponents/MGDContainer';
import MGDHeading from '../../../MGDComponents/MGDHeading';
import MGDSidebar from '../../../MGDComponents/MGDSidebar';
import { EditorModel } from '../../../model/editormodel';
import Chart from './Chart';
import ApplicationConfigurePage from './ConfigurePage';
import ApplicationLogPage from './LogPage';
import {
  Application2060Setting,
  colors2060,
  Dialog2060Interface,
  fixedlocalhost,
  Log2060,
  ReadingRecord,
} from './model';
import { setInterval, clearInterval } from 'timers';
import { obtainData } from './DataFeeder';
import {
  makeRecord,
  propagateReadings,
  testMeasurement2060,
} from './ReadingCalculator';
import { Popover2 } from '@blueprintjs/popover2';
import { ViewFunctionInterface } from '../../../model/ViewFunctionModel';
import React from 'react';
import { Logger } from '../../../utils/ModelFunctions';

const Application2060: React.FC<{
  model: EditorModel;
  showMsg: (msg: IToastProps) => void;
  setView: (view: ViewFunctionInterface) => void;
}> = function ({ model, showMsg, setView }) {
  const [setting, setSetting] = useState<Application2060Setting>({
    source: '',
    emissions: [],
  });
  const [diagProps, setDiagProps] = useState<Dialog2060Interface | undefined>(
    undefined
  );
  const [liveCount, setLiveCount] = useState<number>(0);
  const [logs, setLogs] = useState<Log2060>({ hasFail: false, records: [] });

  function updateLive() {
    setLiveCount(x => {
      Logger.log('Live', x);
      return x + 1;
    });
  }

  function onClose() {
    setDiagProps(undefined);
  }

  function onError(msg: string) {
    showMsg({
      message: msg,
      intent: 'danger',
    });
  }

  function onMessage(msg: string) {
    showMsg({
      message: msg,
      intent: 'primary',
    });
  }

  const configDiagProps: Dialog2060Interface = {
    title: 'Configuration',
    content: ApplicationConfigurePage,
    fullscreen: false,
  };

  const result = useMemo(() => {
    const readings =
      setting.source === fixedlocalhost ? obtainData(fixedlocalhost) : [];
    const [records] = propagateReadings(readings, setting.emissions);
    testMeasurement2060(model, records);
    const now = new Date();
    for (const r of records) {
      if (r.result !== undefined) {
        if (!r.result.overall) {
          logs.hasFail = true;
        }
        logs.records.push({
          time: now,
          data: r,
        });
      }
    }
    setLogs({ ...logs });
    return records;
  }, [liveCount]);

  const resultCombined: ReadingRecord[] = [];
  for (let i = 0; i < Math.max(setting.emissions.length, result.length); i++) {
    if (i < result.length && i < setting.emissions.length) {
      const r = { ...result[i] };
      r.source = setting.emissions[i];
      resultCombined.push(r);
    } else if (i < setting.emissions.length) {
      resultCombined.push(makeRecord(setting.emissions[i]));
    }
  }

  useEffect(() => {
    const interval = setInterval(updateLive, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MGDSidebar>
      {diagProps !== undefined && (
        <Dialog
          isOpen={true}
          title={diagProps.title}
          style={
            diagProps.fullscreen
              ? { ...dialogLayout, ...dialogLayoutFull }
              : applicationDialogLayout
          }
          onClose={onClose}
          canEscapeKeyClose={false}
          canOutsideClickClose={false}
        >
          <diagProps.content
            onClose={onClose}
            setting={setting}
            setSetting={setSetting}
            onError={onError}
            onMessage={onMessage}
          />
        </Dialog>
      )}
      <MGDContainer>
        <MGDHeading> PAS 2060 Dashboard </MGDHeading>
      </MGDContainer>
      <MGDContainer>
        <ButtonGroup>
          <Button
            intent="primary"
            icon="cog"
            onClick={() => setDiagProps(configDiagProps)}
          >
            Configure
          </Button>
          <Popover2
            content={
              <ApplicationLogPage
                setView={setView}
                logs={logs}
                clearAlert={
                  logs.hasFail
                    ? () => setLogs({ ...logs, hasFail: false })
                    : undefined
                }
              />
            }
            position="left"
          >
            <Button
              intent={logs.hasFail ? 'danger' : 'primary'}
              icon="history"
              rightIcon={logs.hasFail ? <Text>!</Text> : undefined}
            >
              Logs
            </Button>
          </Popover2>
        </ButtonGroup>
      </MGDContainer>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        {resultCombined.map((r, index) => (
          <Chart
            key={`chart#${index}`}
            color={colors2060[index % colors2060.length]}
            percentage={(r.totalinclude * 100) / r.total}
            textcolor={
              r.result === undefined || r.result.overall ? 'green' : 'red'
            }
            title={r.source.name === '' ? `Source ${index + 1}` : r.source.name}
          />
        ))}
      </div>
    </MGDSidebar>
  );
};

export default Application2060;
