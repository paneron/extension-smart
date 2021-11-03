import { Spinner, Text } from '@blueprintjs/core';
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

export const LoadingScreen = (props: { label?: string; size?: number }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
    }}
  >
    <LoadingContainer {...props} />
  </div>
);
