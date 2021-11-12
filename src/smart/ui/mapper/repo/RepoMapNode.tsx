import { Button, Text } from '@blueprintjs/core';
import { RepoItem } from '../../../model/repo';
import { Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';

export function createNodeContent(
  label: string,
  item: RepoItem | undefined,
  loadModel?: (x: string) => void
): JSX.Element {
  return (
    <>
      <Tooltip2 content={item ? item.title : ''}>
        <div
          style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text ellipsize>{label}</Text>
        </div>
      </Tooltip2>
      {item && loadModel && (
        <div
          style={{
            position: 'fixed',
            right: -10,
            top: -15,
          }}
        >
          <Tooltip2 content="View item" position="top">
            <Button
              style={{
                display: 'absolute',
              }}
              icon="eye-open"
              onClick={() => loadModel(item.namespace)}
            />
          </Tooltip2>
        </div>
      )}
    </>
  );
}
