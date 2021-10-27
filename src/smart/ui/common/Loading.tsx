/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Spinner, Text } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React from 'react';

export const LoadingPage = ({ label }: { label?: string }) => (
  <>
    <Spinner size={50} intent="primary" />
    {label !== undefined && <Text>{label}</Text>}
  </>
);

export const LoadingContainer = (props: { label?: string; size?: number }) => (
  <div
    style={{
      flex: props.size ?? 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <LoadingPage {...props} />
  </div>
);
