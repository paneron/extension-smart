import { Card, Icon, Menu, MenuItem, Text } from '@blueprintjs/core';
import { ContextMenu2, Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';
import { RepoItems } from '../../model/repo';

type VF = () => void;

function getFullDesc(item: RepoItems): string {
  if (item.shortname !== '' && item.title !== '') {
    return `${item.shortname} [${item.namespace}]: ${item.title}`;
  }
  if (item.shortname !== '') {
    return `${item.shortname} [${item.namespace}]`;
  }
  if (item.title !== '') {
    return `[${item.namespace}]: ${item.title}`;
  }
  return `[${item.namespace}]`;
}

const RepoModelFile: React.FC<{
  file: RepoItems;
  onDelete: VF;
  onOpen: VF;
}> = function (props) {
  const { file, onOpen } = props;
  return (
    <ContextMenu2 content={<ItemMenu {...props} />}>
      <Tooltip2 content={getFullDesc(file)}>
        <Card
          style={{
            width          : 160,
            height         : 200,
            display        : 'flex',
            alignItems     : 'center',
            justifyContent : 'center',
            flexDirection  : 'column',
          }}
          onDoubleClick={onOpen}
          interactive={true}
        >
          <Icon
            icon={file.type === 'Doc' ? 'document' : 'layout-hierarchy'}
            iconSize={80}
          />
          <div
            style={{
              width      : 160,
              marginTop  : 10,
              fontSize   : 18,
              fontWeight : 'bold',
              textAlign  : 'center',
            }}
          >
            <Text ellipsize>
              {file.shortname !== '' ? file.shortname : `[${file.namespace}]`}
            </Text>
          </div>
        </Card>
      </Tooltip2>
    </ContextMenu2>
  );
};

const ItemMenu: React.FC<{
  onDelete: VF;
  onOpen: VF;
}> = function ({ onDelete, onOpen }) {
  return (
    <Menu>
      <MenuItem text="Open" onClick={onOpen} />
      <MenuItem text="Delete" intent="danger" onClick={onDelete} />
    </Menu>
  );
};

export default RepoModelFile;
