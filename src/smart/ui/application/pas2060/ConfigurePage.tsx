/** @jsx jsx */
/** @jsxFrag React.Fragment */

import {
  Text,
  Button,
  ControlGroup,
  FormGroup,
  InputGroup,
} from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import { jsx } from '@emotion/react';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { useContext } from 'react';
import MGDContainer from '../../../MGDComponents/MGDContainer';
import MGDDisplayPane from '../../../MGDComponents/MGDDisplayPane';
import BuildingMap from './BuildingMap';
import { obtainData } from './DataFeeder';
import { Application2060Setting, EmissionSource } from './model';
import { propagateReadings } from './ReadingCalculator';

const ApplicationConfigurePage: React.FC<{
  onClose: () => void;
  setting: Application2060Setting;
  setSetting: (s: Application2060Setting) => void;
  onError: (msg: string) => void;
  onMessage: (msg: string) => void;
}> = function ({ onClose, setting, setSetting, onError, onMessage }) {
  const sources = setting.emissions;
  const overlapped: boolean[] = sources.map(() => false);
  for (let i = 0; i < sources.length; i++) {
    for (let j = i + 1; j < sources.length; j++) {
      const s1 = sources[i];
      const s2 = sources[j];
      if (s1.box !== undefined && s2.box !== undefined) {
        const b1 = s1.box;
        const b2 = s2.box;
        if (
          overlap(b1.minx, b1.maxx, b2.minx, b2.maxx) &&
          overlap(b1.miny, b1.maxy, b2.miny, b2.maxy) &&
          overlap(b1.minz, b1.maxz, b2.minz, b2.maxz)
        ) {
          overlapped[i] = true;
          overlapped[j] = true;
        }
      }
    }
  }

  function onItemChange(index: number, item: EmissionSource) {
    setting.emissions[index] = item;
    setSetting({ ...setting });
  }

  function onItemDelete(index: number) {
    setting.emissions.splice(index, 1);
    setSetting({ ...setting });
  }

  function onAddClick() {
    setting.emissions.push({
      name: '',
    });
    setSetting({ ...setting });
  }

  function testConnection() {
    try {
      const readings = obtainData(setting.source);
      const [, count] = propagateReadings(readings, setting.emissions);
      onMessage(
        `Obtained ${readings.length} readings. ${count} are not assigned to any source`
      );
    } catch (e) {
      onError(e as string);
    }
  }

  return (
    <MGDDisplayPane isBSI={false}>
      <FormGroup label="Sensor readings source">
        <ControlGroup fill>
          <InputGroup
            value={setting.source}
            placeholder="URL of the aggregator"
            onChange={x => setSetting({ ...setting, source: x.target.value })}
          />
          <Button intent="primary" onClick={testConnection}>
            Test
          </Button>
        </ControlGroup>
      </FormGroup>
      <ControlGroup fill>
        <fieldset>
          <legend>Emission sources</legend>
          {setting.emissions.map((e, index) => (
            <EmissionItem
              key={`emissionitem#${index}`}
              item={e}
              index={index}
              onChange={item => onItemChange(index, item)}
              onDelete={() => onItemDelete(index)}
              overlapped={overlapped[index]}
            />
          ))}
          <Button intent="primary" icon="plus" onClick={() => onAddClick()}>
            Add source
          </Button>
        </fieldset>
        <BuildingMap setting={setting} />
      </ControlGroup>
      <MGDContainer>
        <Button intent="success" onClick={() => onClose()}>
          Done
        </Button>
      </MGDContainer>
    </MGDDisplayPane>
  );
};

const EmissionItem: React.FC<{
  item: EmissionSource;
  index: number;
  onChange: (item: EmissionSource) => void;
  onDelete: () => void;
  overlapped: boolean;
}> = function ({ item, onChange, onDelete, index, overlapped }) {
  const { useDecodedBlob, requestFileFromFilesystem } =
    useContext(DatasetContext);

  function handleOpen() {
    if (requestFileFromFilesystem && useDecodedBlob) {
      requestFileFromFilesystem(
        {
          prompt: 'Choose a file to open',
          allowMultiple: false,
          filters: [
            { name: 'IFC JSON', extensions: ['json'] },
            { name: 'GML', extensions: ['gml'] },
            { name: 'IFC XML', extensions: ['ifcxml'] },
            { name: 'ifcOWL', extensions: ['ttl'] },
          ],
        },
        selectedFiles => {
          const fileData = Object.values(selectedFiles ?? {})[0];
          if (fileData) {
            const fileDataAsString = useDecodedBlob({
              blob: fileData,
            }).asString;
            const parsed = JSON.parse(fileDataAsString);
            const [minx, miny, minz] = (parsed.Polygon[0].Coordinates as string)
              .split(' ')
              .map(x => parseInt(x));
            const [maxx, maxy, maxz] = (parsed.Polygon[1].Coordinates as string)
              .split(' ')
              .map(x => parseInt(x));
            item.box = { minx, miny, minz, maxx, maxy, maxz };
            onChange({ ...item });
          } else {
            throw new Error('Import file: no file data received');
          }
        }
      );
    } else {
      throw new Error('File import function not availbale');
    }
  }

  return (
    <ControlGroup fill>
      <InputGroup
        value={item.name}
        placeholder="Name of the emission source"
        onChange={x => onChange({ ...item, name: x.target.value })}
        leftElement={<Text>#{index + 1}:</Text>}
        rightElement={
          <Tooltip2 content="Delete source">
            <Button icon="cross" onClick={onDelete} intent="danger" />
          </Tooltip2>
        }
      />
      <Button
        icon="blank"
        rightIcon={
          item.box === undefined ? 'blank' : overlapped ? 'error' : 'tick'
        }
        onClick={handleOpen}
        intent={
          item.box === undefined ? 'warning' : overlapped ? 'danger' : 'success'
        }
      >
        {overlapped ? 'Overlapped' : 'Set Location'}
      </Button>
    </ControlGroup>
  );
};

function overlap(
  low1: number,
  high1: number,
  low2: number,
  high2: number
): boolean {
  return high1 > low2 && high2 > low1;
}

export default ApplicationConfigurePage;
