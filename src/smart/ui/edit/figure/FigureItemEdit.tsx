/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { Button, FormGroup, Text } from '@blueprintjs/core';
import { MMELFigure } from '../../../serialize/interface/supportinterface';
import { NormalTextField } from '../../common/fields';
import { useContext } from 'react';
import { FILE_TYPE, handleFileOpen } from '../../../utils/IOFunctions';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';

const FigItemEditPage: React.FC<{
  object: MMELFigure;
  setObject: (obj: MMELFigure) => void;
}> = ({ object: fig, setObject: setFig }) => {
  const { useDecodedBlob, requestFileFromFilesystem } =
    useContext(DatasetContext);

  function loadImg() {
    handleFileOpen({
      useDecodedBlob,
      requestFileFromFilesystem,
      type: FILE_TYPE.IMG,
      postProcessing: x => setFig({ ...fig, data: x }),
      base64: true,
    });
  }

  return (
    <FormGroup>
      <NormalTextField
        text="Figure ID"
        value={fig.id}
        onChange={x => setFig({ ...fig, id: x.replaceAll(/\s+/g, '') })}
      />
      <NormalTextField
        text="Figure title"
        value={fig.title}
        onChange={x => setFig({ ...fig, title: x })}
      />
      <div>
        <Text>Image:</Text>
        {fig.data !== '' ? (
          <img
            style={{ maxWidth: '100%' }}
            src={`data:image/jpeg;base64,${fig.data}`}
          />
        ) : (
          <Text>No image</Text>
        )}
      </div>
      <Button icon="import" onClick={loadImg}>
        Load image
      </Button>
    </FormGroup>
  );
};

export default FigItemEditPage;
