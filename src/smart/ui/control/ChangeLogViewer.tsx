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
import { HyEditAction } from '../../model/editor/hybird/distributor';
import { PageAction } from '../../model/editor/components/pages';

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
      <td>{item.time}</td>
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
  if (com.act === 'hybird') {
    return descHybird(com);
  }
  if (com.act === 'enums') {
    return descPattern(com, 'enum');
  }
  if (com.act === 'figure') {
    return descPattern(com, 'figure');
  }
  if (com.act === 'meta') {
    return 'Update metadata';
  }
  if (com.act === 'pages') {
    return descPage(com);
  }
  if (com.act === 'refs') {
    return descPattern(com, 'reference');
  }
  if (com.act === 'section') {
    return descPattern(com, 'section');
  }
  if (com.act === 'table') {
    return descPattern(com, 'table');
  }
  if (com.act === 'roles') {
    return descPattern(com, 'role');
  }
  if (com.act === 'terms') {
    return descPattern(com, 'terms');
  }
  if (com.act === 'vars') {
    return descPattern(com, 'variables');
  }
  if (com.act === 'view') {
    return descPattern(com, 'view profile');
  }
  return 'Unknown command';
}

function descPattern<T extends {task: 'add' | 'delete' | 'edit'}>(com: T, name: string): string {
  if (com.task === 'add') {
    return `Add ${name}`;
  }
  if (com.task === 'delete') {
    return `Delete ${name}`;
  }
  if (com.task === 'edit') {
    return `Edit ${name}`;
  }
  return `Unknown ${name} command`;
}

function descPage(com: PageAction):string {
  if (com.task === 'new-element') {
    return `Add element ${com.value.id}`;
  }
  if (com.task === 'delete-element') {
    return `Delete element ${com.value.id}`;
  }
  if (com.task === 'new-edge') {
    return `New edges`;
  }
  if (com.task === 'delete-edge') {
    return 'Delete edges';
  }
  if (com.task === 'move') {
    return `Move element ${com.node}`;
  }
  return 'Unknown page command';
}

function descHybird(com: HyEditAction): string {
  if (com.task === 'dc-import-ref') {
    return `Edit attributes in ${com.id}`;
  }
  if (com.task === 'egate-edit') {
    return `Edit gateway ${com.id}`;
  }
  if (com.task === 'process-bringin') {
    return `Bring in process ${com.id}`;
  }
  if (com.task === 'process-bringout') {
    return `Bring out process ${com.id}`;
  }
  if (com.task === 'process-delete') {
    return `Delete process ${com.id}`;
  }
  if (com.task === 'process-edit') {
    return `Edit process ${com.id}`;
  }
  if (com.task === 'process-add-page') {
    return `Add subprocess to ${com.id}`;
  }
  if (com.task === 'process-remove-page') {
    return `Remove subprocess from ${com.id}`;
  }
  if (com.task === 'elm-import') {
    return `Import element ${com.id} from reference`;
  }
  if (com.task === 'process-delete-reverse') {
    return `Undo delete process ${com.id}`;
  }
  if (com.task === 'registry-import-ref') {
    return `Edit attributes in ${com.id}`;
  }
  return 'Unknown hybird action';
}

function descComment(com: CommentAction): string {
  if (com.task === 'add') {
    return 'Add comment';
  } else if (com.task === 'delete') {
    return 'Delete comment';
  } else if (com.task === 'edit') {
    return com.value.resolved ? 'Resolve comment' : 'Reopen comment';
  }
  return 'Unknown comment action';
}

function descElements(com: ElmAction): string {
  if (com.task === 'add') {
    return 'Add element';
  } else if (com.task === 'delete') {
    return 'Delete element';
  } else if (com.task === 'edit') {
    return 'Edit element';
  }
  return 'Unknown element action';
}

export default ChangeLogDialog;
