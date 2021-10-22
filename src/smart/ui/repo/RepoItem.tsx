/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Card, Icon, Menu, MenuItem } from '@blueprintjs/core';
import { ContextMenu2, Tooltip2 } from '@blueprintjs/popover2';
import { jsx } from '@emotion/react';
import { RepoItem } from '../../model/repo';

const RepoModelFile: React.FC<{ file: RepoItem; onDelete: () => void }> =
  function ({ file, onDelete }) {
    return (
      <ContextMenu2 content={<ItemMenu onDelete={onDelete} />}>
        <Card
          style={{
            width: '15vw',
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
          interactive={true}
        >
          <Tooltip2 content={file.title}>
            <Icon icon="document" iconSize={80} />
          </Tooltip2>
          <h4>{file.shortname}</h4>
        </Card>
      </ContextMenu2>
    );
  };

const ItemMenu: React.FC<{ onDelete: () => void }> = function ({ onDelete }) {
  return (
    <Menu>
      <MenuItem text="Delete" intent="danger" onClick={onDelete} />
    </Menu>
  );
};

export default RepoModelFile;
