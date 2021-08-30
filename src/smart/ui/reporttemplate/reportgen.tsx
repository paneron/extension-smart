import React, { useContext } from 'react';
import { FormGroup } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import MGDButtonGroup from '../../MGDComponents/MGDButtonGroup';
import MGDButton from '../../MGDComponents/MGDButton';
import { NormalTextField } from '../common/fields';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
import { FILE_TYPE, saveToFileSystem } from '../../utils/IOFunctions';

const ReportGen: React.FC<{
  report: string;
  onClose: () => void;
}> = function ({ report, onClose }) {
  const { getBlob, writeFileToFilesystem } = useContext(DatasetContext);

  async function handleSave() {
    await saveToFileSystem({
      getBlob, 
      writeFileToFilesystem, 
      fileData: report, 
      type: FILE_TYPE.Report
    });
  }

  return (
    <MGDDisplayPane>
      <FormGroup>
        <NormalTextField value={report} text="Report" rows={20} />
        <MGDButtonGroup>
          <MGDButton
            key="ui#report#save"
            icon="floppy-disk"
            onClick={handleSave}
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
