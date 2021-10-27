/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { Button, Text } from '@blueprintjs/core';
import { RepoItem } from '../../../model/repo';
import { Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';

export function createNodeContent(
  label: string,
  item: RepoItem | undefined,
  loadModel: (x: string) => void
): JSX.Element {
  return (
    <>
      <Tooltip2 content={item ? item.title : ''}>
        <Text ellipsize>{label}</Text>
      </Tooltip2>
      {item !== undefined && (
        <div
          style={{
            position: 'fixed',
            right: -10,
            top: -10,
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
