import { Card, Icon, Menu, MenuItem, Text } from '@blueprintjs/core';
import { ContextMenu2, Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';
import { RepoItem } from '../../model/repo';

type VF = () => void;

const RepoModelFile: React.FC<{ file: RepoItem; onDelete: VF; onOpen: VF }> =
  function ({ file, onDelete, onOpen }) {
    return (
      <ContextMenu2 content={<ItemMenu onDelete={onDelete} onOpen={onOpen} />}>
        <Tooltip2 content={`${file.shortname} ${file.title}`}>
          <Card
            style={{
              width: 160,
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
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
                width: 160,
                marginTop: 10,
                fontSize: 18,
                fontWeight: 'bold',
                textAlign: 'center',
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

const ItemMenu: React.FC<{ onDelete: VF; onOpen: VF }> = function ({
  onDelete,
  onOpen,
}) {
  return (
    <Menu>
      <MenuItem text="Open" onClick={onOpen} />
      <MenuItem text="Delete" intent="danger" onClick={onDelete} />
    </Menu>
  );
};

export default RepoModelFile;
