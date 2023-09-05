import React, { useContext } from 'react';
import { Menu, MenuItem } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { FILE_TYPE, handleDocumentOpen } from '@/smart/utils/IOFunctions';
import type { MMELDocument } from '@/smart/model/document';

const MapperDocumentMenu: React.FC<{
  setDocument: (x: MMELDocument) => void;
}> = function ({ setDocument }) {
  const { requestFileFromFilesystem } = useContext(DatasetContext);

  return (
    <Menu>
      <MenuItem
        text="Open SMART Document"
        onClick={() =>
          handleDocumentOpen({
            setDocument,
            requestFileFromFilesystem,
            fileType : FILE_TYPE.Document,
          })
        }
        icon="document-open"
      />
      <MenuItem
        text="Open XML Document"
        onClick={() =>
          handleDocumentOpen({
            setDocument,
            requestFileFromFilesystem,
            fileType : FILE_TYPE.XML,
          })
        }
        icon="document-open"
      />
    </Menu>
  );
};

export default MapperDocumentMenu;
