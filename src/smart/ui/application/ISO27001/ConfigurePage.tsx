import type {
  NumberRange } from '@blueprintjs/core';
import {
  Button,
  ControlGroup,
  FormGroup,
  InputGroup,
  RangeSlider,
  NumericInput,
  Text,
} from '@blueprintjs/core';
import React from 'react';
import MGDContainer from '@/smart/MGDComponents/MGDContainer';
import MGDDisplayPane from '@/smart/MGDComponents/MGDDisplayPane';
import { obtainData } from '@/smart/ui/application/ISO27001/DataFeeder';
import type { Application27001Setting } from '@/smart/ui/application/ISO27001/model';
import { fixedlocalhost } from '@/smart/ui/application/ISO27001/model';

const Application27001ConfigurePage: React.FC<{
  onClose: () => void;
  setting: Application27001Setting;
  setSetting: (s: Application27001Setting) => void;
  onError: (msg: string) => void;
  onMessage: (msg: string) => void;
}> = function ({ onClose, setting, setSetting, onError, onMessage }) {
  function onFailRangeChange(value: NumberRange) {
    setSetting({ ...setting, failMonitor : { min : value[0], max : value[1] }});
  }

  function onRefConnectionChange(x: number) {
    setSetting({ ...setting, connectionRefLine : x });
  }

  function testConnection() {
    try {
      obtainData(setting.source);
      onMessage(`Connected: ${setting.source}`);
    } catch (e) {
      onError(e as string);
    }
  }

  return (
    <MGDDisplayPane isBSI={false}>
      <FormGroup label="Data stream source">
        <Text>
          To generate artificial data for testing, use &quot;{fixedlocalhost}&quot;
        </Text>
        <ControlGroup fill>
          <InputGroup
            value={setting.source}
            placeholder="URL of the data stream source"
            onChange={x => setSetting({ ...setting, source : x.target.value })}
          />
          <Button intent="primary" onClick={testConnection}>
            Test
          </Button>
        </ControlGroup>
      </FormGroup>
      <FormGroup label="Display range of chart (Failed Login)">
        <RangeSlider
          min={0}
          max={100}
          stepSize={1}
          labelStepSize={20}
          onChange={onFailRangeChange}
          value={[setting.failMonitor.min, setting.failMonitor.max]}
        />
      </FormGroup>
      <FormGroup label="Reference connection number">
        <NumericInput
          min={0}
          value={setting.connectionRefLine}
          placeholder="Enter a number..."
          onValueChange={onRefConnectionChange}
          stepSize={10}
          minorStepSize={1}
        />
      </FormGroup>
      <MGDContainer>
        <Button intent="success" onClick={() => onClose()}>
          Done
        </Button>
      </MGDContainer>
    </MGDDisplayPane>
  );
};

export default Application27001ConfigurePage;
