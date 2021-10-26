/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { Menu, MenuItem } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { useContext } from 'react';
import { ModelWrapper } from '../../model/modelwrapper';
import {
  FILE_TYPE,
  handleDocumentOpen,
  handleModelOpen,
} from '../../utils/IOFunctions';
import { MMELDocument } from '../../model/document';

const RepoImportMenu: React.FC<{
  addRefMW: (x: ModelWrapper) => void;
  addImpMW: (x: ModelWrapper) => void;
  addDoc: (x: MMELDocument) => void;
  isBSIEnabled?: boolean;
}> = function ({ addRefMW, addImpMW, addDoc, isBSIEnabled = false }) {
  const { useDecodedBlob, requestFileFromFilesystem } =
    useContext(DatasetContext);

  function onImportModel(postProcess: (x: ModelWrapper) => void) {
    handleModelOpen({
      setModelWrapper: postProcess,
      useDecodedBlob,
      requestFileFromFilesystem,
    });
  }

  return (
    <Menu>
      <MenuItem
        text="Reference model"
        onClick={() => onImportModel(addRefMW)}
      />
      <MenuItem
        text="Implementation model"
        onClick={() => onImportModel(addImpMW)}
      />
      <MenuItem
        text="SMART Document"
        onClick={() =>
          handleDocumentOpen({
            setDocument: addDoc,
            useDecodedBlob,
            requestFileFromFilesystem,
            fileType: FILE_TYPE.Document,
          })
        }
      />
      <MenuItem
        text="XML Document"
        onClick={() =>
          handleDocumentOpen({
            setDocument: addDoc,
            useDecodedBlob,
            requestFileFromFilesystem,
            fileType: FILE_TYPE.XML,
          })
        }
      />
      {isBSIEnabled && (
        <MenuItem
          text="XML Document"
          onClick={() =>
            handleDocumentOpen({
              setDocument: addDoc,
              useDecodedBlob,
              requestFileFromFilesystem,
              fileType: FILE_TYPE.BSI,
            })
          }
        />
      )}
    </Menu>
  );
};

export default RepoImportMenu;
