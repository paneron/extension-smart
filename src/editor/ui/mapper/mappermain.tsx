/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@emotion/react';
import React, { useState } from 'react';
import styled from '@emotion/styled';
import ModelView from './viewmain';
import { MapLinkState, ModelType } from './model/mapperstate';
import MappingCanvus from './component/mapppingLayer';
import { MappingProfile } from './model/MappingProfile';
import { MapperFunctions } from './util/helperfunctions';
import MappingLegendPane from './component/mappinglegend';

const ModelMapper: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const [mState, setMState] = useState<MapLinkState>({
    source: new Map<string, MappingProfile>(),
    dest: new Map<string, MappingProfile>(),
    isMap: false,
    dummy: false,
  });

  const setIsMap = (x: boolean) => {
    mState.isMap = x;
    if (x) {
      MapperFunctions.reCalculateMapped();
    }
    setMState({ ...mState });
  };

  const updateLoc = () => {
    mState.dummy = !mState.dummy;
    setMState({ ...mState });
  };

  MapperFunctions.isMap = mState.isMap;
  MapperFunctions.setIsMap = setIsMap;

  let ret: JSX.Element;
  if (isVisible) {
    ret = (
      <div>
        <ContainerRight>
          <ModelView
            maps={mState.dest}
            isMap={mState.isMap}
            setIsMap={setIsMap}
            forceupdate={updateLoc}
            type={ModelType.ReferenceModel}
          />
        </ContainerRight>
        <ContainerLeft>
          <ModelView
            maps={mState.source}
            isMap={mState.isMap}
            setIsMap={setIsMap}
            forceupdate={updateLoc}
            type={ModelType.ImplementationModel}
          />
        </ContainerLeft>
        <MappingCanvus data={mState} />
        <VerticalLine />
        {mState.isMap ? <MappingLegendPane /> : ''}
      </div>
    );
  } else {
    ret = <div></div>;
  }
  return ret;
};

const ContainerLeft = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 50%;
`;

const ContainerRight = styled.div`
  position: absolute;
  left: 50%;
  top: 0;
  right: 0;
  bottom: 0;
`;

const VerticalLine = styled.div`
  border-left: 2px solid black;
  height: 100%;
  position: absolute;
  left: 50%;
  margin-left: -1px;
  top: 0;
`;

export default ModelMapper;
