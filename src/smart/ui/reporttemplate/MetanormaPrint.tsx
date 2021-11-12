import { Button } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React, { useContext } from 'react';
import { FILE_TYPE, saveToFileSystem } from '../../utils/IOFunctions';
import { Logger } from '../../utils/ModelFunctions';

const MetanormaPrint: React.FC<{
  report: string;
}> = function ({ report }) {
  const {
    getBlob,
    writeFileToFilesystem,
    invokeMetanorma,
    useMetanormaInvocationStatus,
  } = useContext(DatasetContext);
  const mnStatusResponse = useMetanormaInvocationStatus!();
  const mnStatus = mnStatusResponse.value;

  async function toPDF() {
    const filename = await saveToFileSystem({
      getBlob,
      writeFileToFilesystem,
      fileData: report,
      type: FILE_TYPE.Report,
    });
    Logger.logger.log('Filename', filename);
    try {
      invokeMetanorma!({ cliArgs: ['-t', 'ribose', filename, '-o', '.'] });
    } catch (e) {
      const error = e as Error;
      Logger.logger.log(error.message);
      Logger.logger.log(error.stack);
    }
  }

  return (
    <>
      <Button onClick={toPDF}>Run Metanorma</Button>
      <div>PID: {mnStatus?.pid ?? 'not running'}</div>
      <textarea>{mnStatus?.stdout ?? ''}</textarea>
      <textarea style={{ color: 'red' }}>{mnStatus?.stderr ?? ''}</textarea>
      Exit code: {mnStatus?.termination?.code ?? 'N/A'}
      <Button
        onClick={() => invokeMetanorma!({ cliArgs: [] })}
        disabled={mnStatus === null || mnStatus.termination !== undefined}
      ></Button>
    </>
  );
};

export default MetanormaPrint;
