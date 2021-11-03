import { Text } from '@blueprintjs/core';
import React from 'react';
import { CSSROOTVARIABLES } from '../../../css/root.css';

const NodeIDField: React.FC<{ nodeid: string; wide?: boolean }> = function ({
  nodeid,
  wide = false,
}) {
  return (
    <div
      style={{
        fontWeight: parseInt(CSSROOTVARIABLES['--font-weight--regular']),
        fontSize: CSSROOTVARIABLES['--font-size--small'],
        textAlign: 'center',
        position: 'absolute',
        top: -20,
        left: wide ? 0 : -50,
        width: 140,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          backgroundColor: 'lightgoldenrodyellow',
          maxWidth: 140,
        }}
      >
        <Text ellipsize>{nodeid}</Text>
      </div>
    </div>
  );
};

export default NodeIDField;
