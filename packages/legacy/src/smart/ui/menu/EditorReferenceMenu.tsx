import React, { useContext } from 'react';
import { Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import {
  FILE_TYPE,
  handleDocumentOpen,
  handleModelOpen,
} from '../../utils/IOFunctions';
import { ReferenceContent } from '@/smart/model/States';
import { indexModel } from '@/smart/model/mapmodel';
import { RepoItemType } from '@/smart/model/repo';

const EditorReferenceMenu: React.FC<{
  setReference: (x: ReferenceContent | undefined) => void;
  isCloseEnabled: boolean;
  isRepo: boolean;
  setType: (x: RepoItemType) => void;
}> = function ({ setReference, isCloseEnabled, isRepo, setType }) {
  const { requestFileFromFilesystem } = useContext(DatasetContext);

  const canOpen = requestFileFromFilesystem;

  const FileModelButton = () => (
    <MenuItem
      text="Open Model"
      disabled={!canOpen}
      onClick={() =>
        handleModelOpen({
          setModelWrapper : setReference,
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
          setDocument : setReference,
          requestFileFromFilesystem,
          fileType    : FILE_TYPE.Document,
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
          setDocument : setReference,
          requestFileFromFilesystem,
          fileType    : FILE_TYPE.XML,
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
