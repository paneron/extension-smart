/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React, { useContext, useMemo } from 'react';
import { MapProfile } from '../../../model/mapmodel';
import { MMELRepo, RepoIndex } from '../../../model/repo';
import { MapperViewOption } from '../../../model/States';
import { getAllRepoMaps } from '../../../utils/repo/CommonFunctions';
import { LoadingPage } from '../../common/Loading';
import RepoMapDiagram from './RepoMapDiagram';

const RepoMapMainView: React.FC<{
  isVisible: boolean;
  viewOption: MapperViewOption;
  onClose: () => void;
  repo?: MMELRepo;
  loadModel: (x: string) => void;
  index: RepoIndex;
}> = function ({ isVisible, viewOption, repo, onClose, loadModel, index }) {
  const { useObjectData } = useContext(DatasetContext);

  const mapFiles = useObjectData({
    objectPaths: getAllRepoMaps(index),
  });

  const maps: Record<string, MapProfile> = useMemo(() => {
    if (!mapFiles.isUpdating) {
      return Object.entries(mapFiles.value.data).reduce<
        Record<string, MapProfile>
      >(
        (obj, [ns, x]) =>
          x !== null ? { ...obj, [ns]: x as MapProfile } : obj,
        {}
      );
    }
    return {};
  }, [mapFiles.isUpdating]);

  if (repo && isVisible) {
    return (
      <Container>
        {index === undefined ? (
          LoadingIndex
        ) : mapFiles.isUpdating ? (
          LoadingMap
        ) : (
          <RepoMapDiagram
            index={index}
            maps={maps}
            repo={repo}
            option={viewOption}
            loadModel={loadModel}
          />
        )}
        <CloseButton onClose={onClose} />
      </Container>
    );
  } else {
    return <></>;
  }
};

const LoadingIndex = LoadingPage({ label: 'Loading repository' });

const LoadingMap = LoadingPage({ label: 'Loading map information' });

const Container: React.FC<{ children: React.ReactNode }> = function ({
  children,
}) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 30,
        right: 10,
        width: '35vw',
        height: '30vh',
        borderStyle: 'solid',
        zIndex: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
      }}
    >
      {children}
    </div>
  );
};

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <Button
      style={{
        position: 'absolute',
        top: 2,
        right: 2,
        zIndex: 21,
      }}
      icon="cross"
      minimal
      onClick={onClose}
    />
  );
}

export default RepoMapMainView;
