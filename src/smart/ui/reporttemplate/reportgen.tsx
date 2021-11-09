import React, { useContext } from 'react';
import { Button, FormGroup } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import MGDButtonGroup from '../../MGDComponents/MGDButtonGroup';
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
      type: FILE_TYPE.Report,
    });
  }

  return (
    <MGDDisplayPane>
      <FormGroup>
        <NormalTextField value={report} text="Report" rows={20} />
        <MGDButtonGroup>
          <Button key="ui#report#save" icon="floppy-disk" onClick={handleSave}>
            Save
          </Button>
          <Button
            key="ui#listview#removebutton"
            icon="disable"
            onClick={onClose}
          >
            Cancel
          </Button>
        </MGDButtonGroup>
      </FormGroup>
    </MGDDisplayPane>
  );
};

export default ReportGen;
