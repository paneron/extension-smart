import { Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React, { useContext } from 'react';
import { MMELDocument } from '../../model/document';
import { docToText } from '../../utils/DocumentFunctions';
import { createNewMMELDocument } from '../../utils/EditorFactory';
import {
  FILE_TYPE,
  handleDocumentOpen,
  saveToFileSystem,
} from '../../utils/IOFunctions';
import MenuButton from './MenuButton';

const DocEditFileMenu: React.FC<{
  doc: MMELDocument;
  setDoc: (x: MMELDocument) => void;
  open: () => void;
}> = function (props) {
  return <MenuButton text="File" content={<DocMenu {...props} />} />;
};

const DocMenu: React.FC<{
  doc: MMELDocument;
  setDoc: (x: MMELDocument) => void;
  open: () => void;
}> = function (props) {
  const { doc, setDoc, open } = props;
  const { requestFileFromFilesystem, writeFileToFilesystem, getBlob } =
    useContext(DatasetContext);

  function handleNew() {
    setDoc(createNewMMELDocument());
  }

  function handleOpen() {
    handleDocumentOpen({
      setDocument : setDoc,
      requestFileFromFilesystem,
      fileType    : FILE_TYPE.Document,
    });
  }

  function handleSave() {
    saveToFileSystem({
      getBlob,
      writeFileToFilesystem,
      fileData : docToText(doc),
      type     : FILE_TYPE.Document,
    });
  }

  return (
    <Menu>
      <MenuItem text="New" onClick={handleNew} icon="document" />
      <MenuItem text="Open" icon="document-open" onClick={handleOpen} />
      <MenuItem text="Save" onClick={handleSave} icon="floppy-disk" />
      <MenuDivider />
      <MenuItem text="Document settings" onClick={open} icon="settings" />
    </Menu>
  );
};

export default DocEditFileMenu;
