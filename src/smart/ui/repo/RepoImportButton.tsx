/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { Button } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { useContext } from 'react';
import { ModelWrapper } from '../../model/modelwrapper';
import { handleModelOpen } from '../../utils/IOFunctions';

const RepoImportButton: React.FC<{
  addMW: (m: ModelWrapper) => void;
}> = function ({ addMW }) {
  const { useDecodedBlob, requestFileFromFilesystem } =
    useContext(DatasetContext);

  function onImport() {
    handleModelOpen({
      setModelWrapper: addMW,
      useDecodedBlob,
      requestFileFromFilesystem,
    });
  }

  return <Button onClick={onImport}>Import model</Button>;
};

export default RepoImportButton;
