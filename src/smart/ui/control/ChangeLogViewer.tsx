/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';

import { Button, Dialog, TextArea } from '@blueprintjs/core';
import React from 'react';
import { dialog_layout, dialog_layout__full } from '../../../css/layout';
import { ChangeLog, ChangeLogEvent } from '../../model/changelog';
import { ModelAction } from '../../model/editor/model';
import { CommentAction } from '../../model/editor/components/comment';
import { Popover2 } from '@blueprintjs/popover2';
import { ElmAction } from '../../model/editor/components/elements';

const ChangeLogDialog: React.FC<{
  log: ChangeLog;
  onClose: () => void;
}> = function ({ log, onClose }) {
  return (
    <Dialog
      key={`dummy${jsx.length}`}
      isOpen={true}
      title="Change log viewer"
      css={[dialog_layout, dialog_layout__full]}
      onClose={onClose}
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
    >
      <ChangeLogViewer log={log} />
    </Dialog>
  );
};

const ChangeLogViewer: React.FC<{ log: ChangeLog }> = function ({ log }) {
  return (
    <table>
      <tr>
        <th>Timestamp</th>
        <th>User</th>
        <th>Action</th>
        <th>Details</th>
      </tr>
      {log.map((x, index) => (
        <LogEntry key={index} item={x} />
      ))}
    </table>
  );
};

const LogEntry: React.FC<{ item: ChangeLogEvent }> = function ({ item }) {
  return (
    <tr>
      <td>{item.time.toLocaleString()}</td>
      <td>{item.user}</td>
      <td>{descEvent(item)}</td>
      <td>
        <Popover2
          content={
            <TextArea readOnly value={JSON.stringify(item, undefined, 2)} />
          }
        >
          <Button>Details</Button>
        </Popover2>
      </td>
    </tr>
  );
};

function descEvent(item: ChangeLogEvent): string {
  if (item.type === 'new') {
    return 'Created the model';
  }
  return descAction(item.command);
}

function descAction(com: ModelAction): string {
  if (com.act === 'comment') {
    return descComment(com);
  }
  if (com.act === 'initModel') {
    return 'Initialize model';
  }
  if (com.act === 'elements') {
    return descElements(com);
  }
  return 'Unknown command';
}

function descComment(com: CommentAction): string {
  if (com.task === 'add') {
    return 'Added comment';
  } else if (com.task === 'delete') {
    return 'Deleted comment';
  } else if (com.task === 'edit') {
    return com.value.resolved ? 'Resolved comment' : 'Reopen comment';
  }
  return 'Unknown comment action';
}

function descElements(com: ElmAction): string {
  if (com.task === 'add') {
    return 'Added element';
  } else if (com.task === 'delete') {
    return 'Deleted element';
  } else if (com.task === 'edit') {
    return 'Edited element';
  }
  return 'Unknown element action';
}

export default ChangeLogDialog;
