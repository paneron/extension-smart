import React, { useContext } from 'react';
import { Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import {
  FILE_TYPE,
  handleDocumentOpen,
  handleModelOpen,
} from '../../utils/IOFunctions';
import { ReferenceContent } from '../../model/States';
import { indexModel } from '../../model/mapmodel';
import { RepoItemType } from '../../model/repo';

const EditorReferenceMenu: React.FC<{
  setReference: (x: ReferenceContent | undefined) => void;
  isBSIEnabled?: boolean;
  isCloseEnabled: boolean;
  isRepo: boolean;
  setType: (x: RepoItemType) => void;
}> = function ({
  setReference,
  isBSIEnabled = false,
  isCloseEnabled,
  isRepo,
  setType,
}) {
  const { useDecodedBlob, requestFileFromFilesystem } =
    useContext(DatasetContext);

  const canOpen = requestFileFromFilesystem && useDecodedBlob;

  const FileModelButton = () => (
    <MenuItem
      text="Open Model"
      disabled={!canOpen}
      onClick={() =>
        handleModelOpen({
          setModelWrapper: setReference,
          useDecodedBlob,
          requestFileFromFilesystem,
          indexModel,
        })
      }
      icon="document-open"
    />
  );

  const FileDocButton = () => (
    <MenuItem
      text="Open SMART Document"
      onClick={() =>
        handleDocumentOpen({
          setDocument: setReference,
          useDecodedBlob,
          requestFileFromFilesystem,
          fileType: FILE_TYPE.Document,
        })
      }
      icon="document-open"
    />
  );

  const FileXMLButton = () => (
    <MenuItem
      text="Open XML Document"
      onClick={() =>
        handleDocumentOpen({
          setDocument: setReference,
          useDecodedBlob,
          requestFileFromFilesystem,
          fileType: FILE_TYPE.XML,
        })
      }
      icon="document-open"
    />
  );

  const FileBSIButton = () => (
    <MenuItem
      text="Open XML Document"
      onClick={() =>
        handleDocumentOpen({
          setDocument: setReference,
          useDecodedBlob,
          requestFileFromFilesystem,
          fileType: FILE_TYPE.BSI,
        })
      }
      icon="document-open"
    />
  );

  const CloseButton = () => (
    <MenuItem
      text="Close Reference"
      onClick={() => setReference(undefined)}
      icon="import"
    />
  );
  const RepoMenu = () => (
    <MenuItem text="Repository">
      <MenuItem
        icon="document-open"
        text="Open reference model"
        onClick={() => setType('Ref')}
      />
      <MenuItem
        icon="document-open"
        text="Open implementation model"
        onClick={() => setType('Imp')}
      />
      <MenuItem
        icon="document-open"
        text="Open document"
        onClick={() => setType('Doc')}
      />
    </MenuItem>
  );

  const CommonButtons = () => (
    <>
      <FileModelButton />
      <FileDocButton />
      <FileXMLButton />
      {isBSIEnabled && <FileBSIButton />}
    </>
  );

  const ExternalMenu = () => (
    <MenuItem text="External files">
      <CommonButtons />
    </MenuItem>
  );

  return (
    <Menu>
      {isRepo ? (
        <>
          <RepoMenu />
          <ExternalMenu />
        </>
      ) : (
        <CommonButtons />
      )}
      {isCloseEnabled && (
        <>
          <MenuDivider />
          <CloseButton />
        </>
      )}
    </Menu>
  );
};

export default EditorReferenceMenu;
