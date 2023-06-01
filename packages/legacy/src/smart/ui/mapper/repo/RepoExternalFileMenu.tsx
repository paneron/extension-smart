import { Menu, MenuItem } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React from 'react';
import { useContext } from 'react';
import { MMELDocument } from '@/smart/model/document';
import { indexModel } from '@/smart/model/mapmodel';
import { ModelWrapper } from '@/smart/model/modelwrapper';
import {
  FILE_TYPE,
  handleDocumentOpen,
  handleModelOpen,
} from '../../../utils/IOFunctions';

const RepoExternalFileMenu: React.FC<{
  setDocument: (x: MMELDocument) => void;
  setModelWrapper: (x: ModelWrapper) => void;
}> = function ({ setDocument, setModelWrapper }) {
  const { requestFileFromFilesystem } = useContext(DatasetContext);

  return (
    <Menu>
      <MenuItem
        text="Open model"
        onClick={() => {
          handleModelOpen({
            setModelWrapper,
            requestFileFromFilesystem,
            indexModel,
          });
        }}
      />
      <MenuItem
        text="Open SMART document"
        onClick={() =>
          handleDocumentOpen({
            setDocument,
            requestFileFromFilesystem,
            fileType : FILE_TYPE.Document,
          })
        }
      />
      <MenuItem
        text="Open XML document"
        onClick={() =>
          handleDocumentOpen({
            setDocument,
            requestFileFromFilesystem,
            fileType : FILE_TYPE.XML,
          })
        }
      />
    </Menu>
  );
};

export default RepoExternalFileMenu;
