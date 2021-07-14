import styled from '@emotion/styled';
import React from 'react';
import { StateMan } from '../interface/state';
import { Simulator } from '../util/simulator';
import { MyTopRightButtons } from './unit/closebutton';

const SimulationPage: React.FC<StateMan> = (sm: StateMan) => {
  const elm = Simulator.getElms();

  return (
    <SideBar>
      <MyTopRightButtons onClick={() => Simulator.close()}>X</MyTopRightButtons>
      <h1> Simulation </h1>
      {elm}
    </SideBar>
  );
};

const SideBar = styled.aside`
  position: fixed;
  width: 30%;
  height: 100%;
  bottom: 0;
  right: 0;
  background-color: white;
  border-style: solid;
  font-size: 12px;
  overflow-y: auto;
  z-index: 110;
`;

export default SimulationPage;
