import React, { useContext } from 'react';
import { FormGroup } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import MGDButtonGroup from '../../MGDComponents/MGDButtonGroup';
import MGDButton from '../../MGDComponents/MGDButton';
import { NormalTextField } from '../common/fields';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';

const ReportGen: React.FC<{
  report: string;
  onClose: () => void;
}> = function ({ report, onClose }) {
  const { getBlob, writeFileToFilesystem } = useContext(DatasetContext);

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
    <MGDDisplayPane>
      <FormGroup>
        <NormalTextField value={report} text="Report" rows={20} />
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
    </MGDDisplayPane>
  );
};

export default ReportGen;
