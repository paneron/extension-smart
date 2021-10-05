/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useContext } from 'react';
import { Menu, MenuItem } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { FILE_TYPE, handleDocumentOpen } from '../../utils/IOFunctions';
import { MMELDocument } from '../../model/document';

const MapperDocumentMenu: React.FC<{
  setDocument: (x: MMELDocument) => void;
}> = function ({ setDocument }) {
  const { useDecodedBlob, requestFileFromFilesystem } =
    useContext(DatasetContext);

  return (
    <Menu>
      <MenuItem
        text="Open SMART Document"
        onClick={() =>
          handleDocumentOpen({
            setDocument,
            useDecodedBlob,
            requestFileFromFilesystem,
            fileType: FILE_TYPE.Document,
          })
        }
        icon="document-open"
      />
      <MenuItem
        text="Open XML Document"
        onClick={() =>
          handleDocumentOpen({
            setDocument,
            useDecodedBlob,
            requestFileFromFilesystem,
            fileType: FILE_TYPE.XML,
          })
        }
        icon="document-open"
      />
    </Menu>
  );
};

export default MapperDocumentMenu;
