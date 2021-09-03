/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import MGDButton from '../../../MGDComponents/MGDButton';
import MGDButtonGroup from '../../../MGDComponents/MGDButtonGroup';
import MGDContainer from '../../../MGDComponents/MGDContainer';
import MGDHeading from '../../../MGDComponents/MGDHeading';
import MGDSidebar from '../../../MGDComponents/MGDSidebar';
import { EditorModel } from '../../../model/editormodel';
import Chart from './Chart';

const Application2060: React.FC<{
  model: EditorModel;
}> = function ({ model }) {
  return (
    <MGDSidebar>
      <MGDContainer>
        <MGDHeading> PAS 2060 Monitor Dashboard </MGDHeading>
      </MGDContainer>
      <MGDButtonGroup>
        <MGDButton icon="cog"> Configure </MGDButton>
        <MGDButton icon="history"> Logs </MGDButton>
      </MGDButtonGroup>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        <Chart
          color="orange"
          percentage="30.5"
          textcolor="red"
          title="Site 1"
        />
        <Chart
          color="green"
          percentage="60.5"
          textcolor="green"
          title="Site 1"
        />
        <Chart
          color="blue"
          percentage="90.5"
          textcolor="green"
          title="Site 1"
        />
        <Chart
          color="yellow"
          percentage="100"
          textcolor="green"
          title="Site 1"
        />
      </div>
    </MGDSidebar>
  );
};

export default Application2060;
