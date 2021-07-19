import styled from '@emotion/styled';
import React from 'react';
import { ModelType, ModelViewStateMan } from '../model/mapperstate';
import { MapperFunctions } from '../util/helperfunctions';

const MapperPathPane: React.FC<ModelViewStateMan> = (sm: ModelViewStateMan) => {
  const state = sm.state;
  const his = state.history;

  const drillup = () => {
    MapperFunctions.saveLayout(sm);
    const page = his.pop();
    state.modelWrapper.page = page;
    MapperFunctions.updateMapRef(sm);
    sm.setState(state);
  };

  return (
    <>
      <PathLabel key="ui#pathlabel">
        {sm.state.type === ModelType.ImplementationModel
          ? 'Implementation model'
          : 'Reference model'}{' '}
        : {his.getMapperPath(sm)}{' '}
      </PathLabel>
      <DrillUpButton key="ui#drillupbutton" onClick={() => drillup()}>
        Drill up
      </DrillUpButton>
    </>
  );
};

const PathLabel = styled.div`
  position: absolute;
  width: 80%;
  top: 0;
  left: 0;
  font-size: 12px;
  overflow-y: auto;
  z-index: 90;
`;

const DrillUpButton = styled.button`
  position: absolute;
  top: 0;
  right: 0%;
  font-size: 12px;
  overflow-y: auto;
  z-index: 90;
`;

export default MapperPathPane;
