/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useMemo, useState } from 'react';
import { useStoreActions, useStoreState } from 'react-flow-renderer';
import { EditorModel, isEditorStartEvent } from '../../model/editormodel';
import {
  DeletableNodeTypes,
  EditableNodeTypes,
  EditAction,
} from '../../utils/constants';
import MGDSidebar from '../../MGDComponents/MGDSidebar';
import { Describe } from './ViewComponentDetails';
import { MMELDataAttribute } from '../../serialize/interface/datainterface';
import {
  MMELProvision,
  MMELReference,
} from '../../serialize/interface/supportinterface';
import QuickEdit from './QuickEditComponents';
import { RefTextSelection } from '../../model/selectionImport';
import { Logger } from '../../utils/ModelFunctions';
import { Dialog } from '@blueprintjs/core';
import { dialog_layout, dialog_layout__full } from '../../../css/layout';
import { EditorAction } from '../../model/editor/state';
import {
  EditNodeType,
  EditorDiag,
  EditorDiagPackage,
  EditorDiagTypes,
} from '../dialog/EditorDialogs';
import {
  DeleteConfirmMessgae,
  deleteNodeAction,
} from '../../utils/ModelRemoveComponentHandler';

export const SelectedNodeDescription: React.FC<{
  model: EditorModel;
  page: string;
  CustomAttribute?: React.FC<{
    att: MMELDataAttribute;
    getRefById?: (id: string) => MMELReference | null;
    dcid: string;
  }>;
  CustomProvision?: React.FC<{
    provision: MMELProvision;
    getRefById?: (id: string) => MMELReference | null;
  }>;
  act?: (x: EditorAction) => void;
  provision?: RefTextSelection;
  onSelect?: (id: string | undefined) => void;
}> = function ({
  model,
  page,
  CustomAttribute,
  CustomProvision,
  act,
  provision,
  onSelect,
}) {
  const flowSelect = useStoreState(store => store.selectedElements);
  const [selectedPage, setSelectedPage] = useState<string | undefined>(
    undefined
  );
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [dialogPack, setDialogPack] = useState<EditorDiagPackage | undefined>(
    undefined
  );

  const setSelectedElements = useStoreActions(a => a.setSelectedElements);

  function setSelectedNodeId(id: string) {
    setSelectedElements([{ id, position: { x: 0, y: 0 } }]);
  }

  const current = model.pages[page];

  Logger.log('Selected:', selected);

  function deselect() {
    setSelected(undefined);
    if (onSelect) {
      onSelect(undefined);
    }
  }

  function setDiag(
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string
  ) {
    if (act) {
      if (action === EditAction.EDIT) {
        setDialogPack({
          type: EditNodeType[nodeType as EditableNodeTypes],
          msg: id,
        });
      } else if (action === EditAction.DELETE) {
        setDialogPack({
          type: EditorDiagTypes.DELETECONFIRM,
          onDelete: () => {
            const action = deleteNodeAction(model, page, id);
            act(action);
          },
          msg: DeleteConfirmMessgae[nodeType],
        });
      }
    }
  }

  useMemo(() => {
    if (flowSelect && flowSelect.length > 0) {
      const s = flowSelect[0];
      Logger.log('FlowSelect:', s.id);
      if (current.childs[s.id] || current.data[s.id]) {
        setSelected(s.id);
        setSelectedPage(page);
        if (onSelect) {
          onSelect(s.id);
        }
      }
    } else {
      deselect();
    }
  }, [flowSelect]);

  if (selected && selectedPage) {
    if (page !== selectedPage) {
      deselect();
    }
  }

  const elm = selected ? model.elements[selected] : undefined;
  const diagProps = dialogPack ? EditorDiag[dialogPack.type] : undefined;

  return (
    <MGDSidebar>
      {diagProps && dialogPack && act && (
        <Dialog
          isOpen={dialogPack !== undefined}
          title={diagProps.title}
          css={diagProps.fullscreen ? [dialog_layout, dialog_layout__full] : ''}
          onClose={() => setDialogPack(undefined)}
          canEscapeKeyClose={false}
          canOutsideClickClose={false}
        >
          <diagProps.Panel
            setModelWrapper={() => {}}
            act={act}
            model={model}
            page={page}
            onDelete={dialogPack.onDelete}
            done={() => setDialogPack(undefined)}
            msg={dialogPack.msg}
            setSelectedNode={setSelectedNodeId}
          />
        </Dialog>
      )}
      {elm ? (
        act && !isEditorStartEvent(elm) ? (
          <QuickEdit
            node={elm}
            modelWrapper={{ page, model, type: 'model' }}
            setModel={() => {}}
            setDialog={setDiag}
            page={model.pages[page]}
            model={model}
            act={act}
            provision={provision}
            setSelectedNode={setSelectedNodeId}
          />
        ) : (
          <Describe
            node={elm}
            model={model}
            page={model.pages[page]}
            CustomAttribute={CustomAttribute}
            CustomProvision={CustomProvision}
          />
        )
      ) : (
        'Nothing is selected'
      )}
    </MGDSidebar>
  );
};
