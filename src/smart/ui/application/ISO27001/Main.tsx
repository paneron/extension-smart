/** @jsx jsx */
/** @jsxFrag React.Fragment */

import {
  Text,
  Button,
  ButtonGroup,
  Dialog,
  IToastProps,
} from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import { useEffect, useMemo, useState } from 'react';
import {
  application_dialog_layout,
  dialog_layout,
  dialog_layout__full,
} from '../../../../css/layout';
import MGDContainer from '../../../MGDComponents/MGDContainer';
import MGDHeading from '../../../MGDComponents/MGDHeading';
import MGDSidebar from '../../../MGDComponents/MGDSidebar';
import { EditorModel } from '../../../model/editormodel';
import Chart27001 from './Chart';
import Application27001ConfigurePage from './ConfigurePage';
import Application27001LogPage from './LogPage';
import { setInterval, clearInterval } from 'timers';
import { obtainData } from './DataFeeder';
import { testMeasurement27001 } from './ReadingCalculator';
import { Popover2 } from '@blueprintjs/popover2';
import { ViewFunctionInterface } from '../../../model/ViewFunctionModel';
import {
  Application27001Setting,
  Dialog27001Interface,
  fixedlocalhost,
  Log27001,
} from './model';
import LineChart27001 from './LineChart';

const Application27001: React.FC<{
  model: EditorModel;
  showMsg: (msg: IToastProps) => void;
  setView: (view: ViewFunctionInterface) => void;
}> = function ({ model, showMsg, setView }) {
  const [setting, setSetting] = useState<Application27001Setting>({
    source: '',
    failMonitor: { min: 10, max: 50 },
    connectionRefLine: 100,
  });
  const [diagProps, setDiagProps] = useState<Dialog27001Interface | undefined>(
    undefined
  );
  const [liveCount, setLiveCount] = useState<number>(0);
  const [logs, setLogs] = useState<Log27001>({ hasFail: false, records: [] });
  const [lineValues, setLineValues] = useState<number[]>([]);

  function updateLineValues(v: number) {
    if (lineValues.length > 10) {
      lineValues.splice(0, 1);
    }
    lineValues.push(v);
    setLineValues([...lineValues]);
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

  const configDiagProps: Dialog27001Interface = {
    title: 'Configuration',
    content: Application27001ConfigurePage,
    fullscreen: false,
  };

  const result = useMemo(() => {
    const readings =
      setting.source === fixedlocalhost
        ? obtainData(fixedlocalhost, liveCount)
        : undefined;
    if (readings !== undefined) {
      const log = testMeasurement27001(model, readings);
      logs.records.push(log);
      setLogs({ ...logs, hasFail: logs.hasFail || !log.result.overall });
      updateLineValues(
        log.data.connections.reduce((max, x) => Math.max(max, x))
      );
      return log;
    }
    return undefined;
  }, [liveCount]);

  useEffect(() => {
    const timer = setInterval(() => setLiveCount(prev => prev + 1), 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <MGDSidebar>
      {diagProps !== undefined && (
        <Dialog
          isOpen={true}
          title={diagProps.title}
          css={
            diagProps.fullscreen
              ? [dialog_layout, dialog_layout__full]
              : [application_dialog_layout]
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
        <MGDHeading> Ribose 27001 Dashboard </MGDHeading>
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
              <Application27001LogPage
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
        <Chart27001 result={result} range={setting.failMonitor} />
        <LineChart27001
          values={lineValues}
          lineRef={setting.connectionRefLine}
          pass={result?.result.overall}
        />
      </div>
    </MGDSidebar>
  );
};

export default Application27001;
