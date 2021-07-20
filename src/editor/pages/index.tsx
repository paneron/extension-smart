/** @jsxRuntime classic */
/** @jsx jsx */

import React, { useState } from 'react';
import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import ModelEditor from '../ui/maineditor';
import ModelMapper from '../ui/mapper/mappermain';

const Home: React.FC<Record<never, never>> = function () {
  const [page, setPage] = useState(Page.Editor);

  const normal: React.CSSProperties = {
    background: '#e7e7e7',
  };

  const selected: React.CSSProperties = {
    background: '#555555',
    color: 'white',
  };

  return (
    <Wrapper>
      <div className="tab">
        <button
          onClick={() => setPage(Page.Editor)}
          style={page === Page.Editor ? selected : normal}
        >
          {' '}
          Editor{' '}
        </button>
        <button
          onClick={() => setPage(Page.Mapper)}
          style={page === Page.Mapper ? selected : normal}
        >
          {' '}
          Mapper{' '}
        </button>
      </div>
      <hr />
      <Main>
        <ModelEditor isVisible={page === Page.Editor} />
        <ModelMapper isVisible={page === Page.Mapper} />
      </Main>
    </Wrapper>
  );
};

enum Page {
  Editor,
  Mapper,
}

const Wrapper = styled.div`
  min-height: 100vh;
  height: 100vh;
`;

const Main = styled.main`
  position: absolute;
  top: 40px;
  right: 0;
  bottom: 0;
  left: 0;
`;

export default Home;
