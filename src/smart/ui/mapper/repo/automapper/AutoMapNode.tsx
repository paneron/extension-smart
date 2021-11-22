import { Checkbox, Text } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';
import { RepoItems } from '../../../../model/repo';
import { Logger } from '../../../../utils/ModelFunctions';

export function createAutoMapNode(
  label: string,
  item: RepoItems | undefined,
  checked?: boolean,
  setChecked?: (x: boolean) => void
): JSX.Element {
  if (checked !== undefined && setChecked) {
    Logger.logger.log('Bingo', label);
  }
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
      {checked !== undefined && setChecked && (
        <div
          style={{
            position: 'fixed',
            right: -10,
            top: -15,
          }}
        >
          <Checkbox
            style={{
              display: 'absolute',
            }}
            checked={checked}
            onChange={x => setChecked((x.target as HTMLInputElement).checked)}
          />
        </div>
      )}
    </>
  );
}
