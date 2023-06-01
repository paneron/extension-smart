import { Button, FormGroup, Text } from '@blueprintjs/core';
import {
  BINARY_TYPE,
  BINARY_TYPES,
  MMELFigure,
} from '@paneron/libmmel/interface/supportinterface';
import { NormalComboBox, NormalTextField } from '@/smart/ui/common/fields';
import { useContext } from 'react';
import { FILE_TYPE, handleFileOpen } from '@/smart/utils/IOFunctions';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React from 'react';
import MultimediaView from '@/smart/ui/common/description/Multimedia';

const FigItemEditPage: React.FC<{
  object: MMELFigure;
  setObject: (obj: MMELFigure) => void;
}> = ({ object: fig, setObject: setFig }) => {
  const { requestFileFromFilesystem, getBlob } =
    useContext(DatasetContext);

  function loadImg() {
    if (fig.type === 'fig') {
      handleFileOpen({
        requestFileFromFilesystem,
        type           : FILE_TYPE.IMG,
        postProcessing : x => setFig({ ...fig, data : x }),
        base64         : true,
      });
    } else if (fig.type === 'video') {
      handleFileOpen({
        requestFileFromFilesystem,
        type           : FILE_TYPE.VIDEO,
        postProcessing : async function (x) {
          // if (getBlob && useDecodedBlob) { // eslint: Will always return true
          if (getBlob) {
            const blob = await getBlob(x);
            const base64 = Buffer.from(blob).toString('base64');
            setFig({ ...fig, data : base64 });
          }
        },
      });
    } else if (fig.type === '3d') {
      setFig({ ...fig, data : 'aa' });
    }
  }

  function typeChanged(x: BINARY_TYPE) {
    if (x !== fig.type) {
      setFig({ ...fig, type : x, data : '' });
    }
  }

  return (
    <FormGroup>
      <NormalTextField
        text="Content ID"
        value={fig.id}
        onChange={x => setFig({ ...fig, id : x.replaceAll(/\s+/g, '') })}
      />
      <NormalTextField
        text="Content title"
        value={fig.title}
        onChange={x => setFig({ ...fig, title : x })}
      />
      <NormalComboBox
        text="Content type"
        value={fig.type}
        onChange={x => typeChanged(x as BINARY_TYPE)}
        options={BINARY_TYPES}
      />
      <div>
        <Text>Content:</Text>
        {fig.data !== '' ? (
          <MultimediaView
            type={fig.type}
            base64={fig.data}
            style={{ maxWidth : '100%' }}
          />
        ) : (
          <Text>No content</Text>
        )}
      </div>
      <Button icon="import" onClick={loadImg}>
        Load content
      </Button>
    </FormGroup>
  );
};

export default FigItemEditPage;
