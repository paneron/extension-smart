import { Classes, Colors, ControlGroup } from '@blueprintjs/core';
import React from 'react';
import { BSI_WHITE_TEXT } from '../../../resources/BSI_logo';

const AppControlBar: React.FC<{
  children: React.ReactNode;
}> = function ({ children }) {
  return (
    <ControlGroup
      vertical
      className={Classes.ELEVATION_3}
      style={{
        zIndex: 14,
        background: Colors.BLUE3,
        width: 32,
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        className={Classes.ELEVATION_2}
        style={{
          zIndex: 14,
          marginBottom: '-2px !important',
          padding: 7,
          height: 24,
          display: 'flex',
          flexFlow: 'column nowrap',
          alignItems: 'center',
          alignSelf: 'stretch',
          justifyContent: 'center',
          overflow: 'hidden',
          background: 'black',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '0 !important',
          letterSpacing: '-0.05em',
        }}
        dangerouslySetInnerHTML={{ __html: BSI_WHITE_TEXT }}
      />
      {children}
    </ControlGroup>
  );
};

export default AppControlBar;
