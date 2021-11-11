import { Button, Card, Icon, InputGroup, Text } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';
import { CSSProperties, useState } from 'react';
import { RepoIndex, RepoItem, RepoItemType } from '../../model/repo';
import { LoadingContainer } from '../common/Loading';

function matchFilter(item: RepoItem, filter: string) {
  return (
    filter === '' ||
    item.namespace.includes(filter) ||
    item.shortname.includes(filter) ||
    item.title.includes(filter)
  );
}

const buttonCSS: CSSProperties = {
  width: 80,
  marginRight: 10,
  marginTop: 8,
};

const RepoItemSelector: React.FC<{
  setRefRepo: (x: string) => void;
  type: RepoItemType;
  onClose: () => void;
  index: RepoIndex;
}> = function ({ type, setRefRepo, onClose, index }) {
  const [filter, setFilter] = useState<string>('');
  const [selected, setSelected] = useState<string | undefined>(undefined);

  function onSelect(ns: string) {
    setRefRepo(ns);
    onClose();
  }

  if (index !== undefined && index !== null) {
    const list = Object.values(index).filter(
      x => x.type === type && matchFilter(x, filter)
    );
    return (
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'auto',
          textAlign: 'center',
        }}
      >
        <InputGroup
          leftIcon="filter"
          onChange={x => setFilter(x.currentTarget.value)}
          placeholder="Filter..."
          value={filter}
        />
        <fieldset
          style={{ width: 'calc(100% - 5px)', height: 'calc(100% - 70px)' }}
        >
          {Object.values(list).length === 0 && <EmptyMsg />}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              margin: 10,
              height: 'calc(100% - 5px)',
              overflowY: 'auto',
            }}
          >
            {list.map(x => (
              <RepoSelectItem
                key={x.namespace}
                file={x}
                onSelect={() => onSelect(x.namespace)}
                onCancel={onClose}
                highlight={selected === x.namespace}
                onClick={() => setSelected(x.namespace)}
              />
            ))}
          </div>
        </fieldset>
        <div style={{ textAlign: 'right' }}>
          <Button style={buttonCSS} onClick={onClose}>
            Cancel
          </Button>
          <Button
            style={buttonCSS}
            disabled={selected === undefined}
            onClick={() => selected && onSelect(selected)}
          >
            Open
          </Button>
        </div>
      </div>
    );
  } else {
    return <LoadingContainer />;
  }
};

const EmptyMsg = () => <p style={{ margin: 10 }}>No item in the repository.</p>;

const RepoSelectItem: React.FC<{
  file: RepoItem;
  onSelect: () => void;
  onCancel: () => void;
  highlight: boolean;
  onClick: () => void;
}> = function ({ file, onSelect, highlight, onClick }) {
  return (
    <div>
      <Tooltip2 content={file.title}>
        <Card
          style={{
            width: '12vw',
            height: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundColor: highlight ? 'lightblue' : undefined,
          }}
          onDoubleClick={onSelect}
          onClick={onClick}
          interactive={true}
        >
          <Icon
            icon={file.type === 'Doc' ? 'document' : 'layout-hierarchy'}
            iconSize={40}
          />
          <div
            style={{
              width: '12vw',
              marginTop: 10,
              fontSize: 14,
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            <Text ellipsize>{file.shortname}</Text>
          </div>
        </Card>
      </Tooltip2>
    </div>
  );
};

export default RepoItemSelector;
