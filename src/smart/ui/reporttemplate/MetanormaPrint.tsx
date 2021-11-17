import { Button } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React, { useContext } from 'react';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
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
      invokeMetanorma!({
        cliArgs: [
          '-t',
          'ribose',
          filename,
          '-o',
          '/Users/wkwong/GitHub/mmel-models/out',
        ],
      });
      mnStatusResponse.refresh();
    } catch (e) {
      const error = e as Error;
      Logger.logger.log(error.message);
      Logger.logger.log(error.stack);
    }
  }

  Logger.logger.log('termination signal', mnStatus?.termination?.signal);
  Logger.logger.log('termination code', mnStatus?.termination?.code);
  Logger.logger.log('stdout:', mnStatus?.stdout);
  Logger.logger.log('stderr:', mnStatus?.stderr);

  return (
    <MGDDisplayPane>
      <Button onClick={toPDF}>Run Metanorma</Button>
      {mnStatus && (
        <>
          <div>PID: {mnStatus.pid ?? 'not running'}</div>
          <textarea value={mnStatus.stdout ?? ''} />
          <textarea style={{ color: 'red' }} value={mnStatus.stderr ?? ''} />
          Exit code: {mnStatus.termination?.code ?? 'N/A'}
        </>
      )}
    </MGDDisplayPane>
  );
};

export default MetanormaPrint;
