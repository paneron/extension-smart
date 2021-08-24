import React, { useContext } from 'react';
import { FormGroup, Text } from '@blueprintjs/core';
import { EditorModel } from '../../model/editormodel';
import { MapProfile } from '../mapper/mapmodel';
import { genReport } from './reportFunctions';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import MGDButtonGroup from '../../MGDComponents/MGDButtonGroup';
import MGDButton from '../../MGDComponents/MGDButton';

const ReportGen: React.FC<{
  mapProfile: MapProfile;
  selected: string;
  refModel: EditorModel;
  impModel: EditorModel;
  onClose: () => void;
}> = function ({ mapProfile, selected, refModel, impModel, onClose }) {
  const { getBlob, writeFileToFilesystem } = useContext(DatasetContext);

  const content = mapProfile.docs[selected];
  const report = genReport(content.content, refModel, impModel);

  function handleSave() {
    return async () => {
      if (getBlob && writeFileToFilesystem) {
        const blob = await getBlob(report);
        await writeFileToFilesystem({
          dialogOpts: {
            prompt: 'Choose location to save',
            filters: [{ name: 'All files', extensions: ['*'] }],
          },
          bufferData: blob,
        });
      } else {
        throw new Error('File export function(s) are not provided');
      }
    };
  }

  return (
    <FormGroup>
      <Text>{report}</Text>
      <MGDButtonGroup>
        <MGDButton
          key="ui#report#save"
          icon="floppy-disk"
          onClick={handleSave()}
        >
          Save
        </MGDButton>
        <MGDButton
          key="ui#listview#removebutton"
          icon="disable"
          onClick={onClose}
        >
          Cancel
        </MGDButton>
      </MGDButtonGroup>
    </FormGroup>
  );
};

export default ReportGen;
