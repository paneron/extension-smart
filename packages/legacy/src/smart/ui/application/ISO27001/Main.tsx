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
} from '@/css/layout';
import MGDContainer from '@/smart/MGDComponents/MGDContainer';
import MGDHeading from '@/smart/MGDComponents/MGDHeading';
import MGDSidebar from '@/smart/MGDComponents/MGDSidebar';
import { EditorModel } from '@/smart/model/editormodel';
import Chart27001 from '@/smart/ui/application/ISO27001/Chart';
import Application27001ConfigurePage from '@/smart/ui/application/ISO27001/ConfigurePage';
import Application27001LogPage from '@/smart/ui/application/ISO27001/LogPage';
import { setInterval, clearInterval } from 'timers';
import { obtainData } from '@/smart/ui/application/ISO27001/DataFeeder';
import { testMeasurement27001 } from '@/smart/ui/application/ISO27001/ReadingCalculator';
import { Popover2 } from '@blueprintjs/popover2';
import { ViewFunctionInterface } from '@/smart/model/ViewFunctionModel';
import {
  Application27001Setting,
  Dialog27001Interface,
  fixedlocalhost,
  Log27001,
} from '@/smart/ui/application/ISO27001/model';
import LineChart27001 from '@/smart/ui/application/ISO27001/LineChart';
import React from 'react';

const Application27001: React.FC<{
  model: EditorModel;
  showMsg: (msg: IToastProps) => void;
  setView: (view: ViewFunctionInterface) => void;
}> = function ({ model, showMsg, setView }) {
  const [setting, setSetting] = useState<Application27001Setting>({
    source            : '',
    failMonitor       : { min : 10, max : 50 },
    connectionRefLine : 100,
  });
  const [diagProps, setDiagProps] = useState<Dialog27001Interface | undefined>(
    undefined
  );
  const [liveCount, setLiveCount] = useState<number>(0);
  const [logs, setLogs] = useState<Log27001>({ hasFail : false, records : []});
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
      message : msg,
      intent  : 'danger',
    });
  }

  function onMessage(msg: string) {
    showMsg({
      message : msg,
      intent  : 'primary',
    });
  }

  const configDiagProps: Dialog27001Interface = {
    title      : 'Configuration',
    content    : Application27001ConfigurePage,
    fullscreen : false,
  };

  const result = useMemo(() => {
    const readings =
      setting.source === fixedlocalhost
        ? obtainData(fixedlocalhost, liveCount)
        : undefined;
    if (readings !== undefined) {
      const log = testMeasurement27001(model, readings);
      logs.records.push(log);
      setLogs({ ...logs, hasFail : logs.hasFail || !log.result.overall });
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
                    ? () => setLogs({ ...logs, hasFail : false })
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
          display        : 'flex',
          flexWrap       : 'wrap',
          justifyContent : 'space-around',
          alignItems     : 'center',
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
