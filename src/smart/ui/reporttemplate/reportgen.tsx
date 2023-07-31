import React, { useContext, useState } from 'react';
import { Button, Dialog, FormGroup } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import MGDButtonGroup from '@/smart/MGDComponents/MGDButtonGroup';
import { NormalTextField } from '@/smart/ui/common/fields';
import MGDDisplayPane from '@/smart/MGDComponents/MGDDisplayPane';
import { FILE_TYPE, saveToFileSystem } from '@/smart/utils/IOFunctions';
import MetanormaPrint from '@/smart/ui/reporttemplate/MetanormaPrint';

const ReportGen: React.FC<{
  report: string;
  onClose: () => void;
}> = function ({ report, onClose }) {
  const { getBlob, writeFileToFilesystem } = useContext(DatasetContext);
  const [print, setPrint] = useState<boolean>(false);

  async function handleSave() {
    await saveToFileSystem({
      getBlob,
      writeFileToFilesystem,
      fileData : report,
      type     : FILE_TYPE.Report,
    });
  }

  return (
    <MGDDisplayPane>
      <FormGroup>
        <NormalTextField value={report} text="Report" rows={20} />
        <MGDButtonGroup>
          <Button icon="floppy-disk" onClick={handleSave}>
            Save
          </Button>
          <Button icon="draw" onClick={() => setPrint(true)}>
            Metanorma
          </Button>
          <Button icon="disable" onClick={onClose}>
            Cancel
          </Button>
        </MGDButtonGroup>
      </FormGroup>
      <Dialog
        isOpen={print}
        title="Metanorma settings"
        onClose={() => setPrint(false)}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
      >
        <MetanormaPrint report={report} />
      </Dialog>
    </MGDDisplayPane>
  );
};

export default ReportGen;
