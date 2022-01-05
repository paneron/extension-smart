import { Button, FormGroup } from '@blueprintjs/core';
import React, { useEffect, useState } from 'react';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
import { editEGateCommand } from '../../model/editor/commands/elements';
import { ModelAction } from '../../model/editor/model';
import {
  EditorEGate,
  EditorModel,
  EditorSubprocess,
} from '../../model/editormodel';
import { MMELEdge } from '../../serialize/interface/flowcontrolinterface';
import {
  checkId,
  getModelAllMeasures,
  removeSpace,
} from '../../utils/ModelFunctions';
import { DescriptionItem } from '../common/description/fields';
import { NormalTextField, ReferenceSelector } from '../common/fields';
import PopoverChangeIDButton from '../popover/PopoverChangeIDButton';
import { EditPageButtons } from './commons';
import EdgeQuickEdit from './components/EdgeListEdit';

interface CommonEGateEditProps {
  onUpdateClick: () => void;
  editing: EditorEGate;
  setEditing: (x: EditorEGate) => void;
  edges: MMELEdge[];
  setEdges: (es: MMELEdge[]) => void;
  onFullEditClick?: () => void;
  onDeleteClick?: () => void;
}

const EditEGatePage: React.FC<{
  model: EditorModel;
  act: (x: ModelAction) => void;
  egate: EditorEGate;
  closeDialog?: () => void;
  minimal?: boolean;
  onFullEditClick?: () => void;
  onDeleteClick?: () => void;
  setSelectedNode?: (id: string) => void;
  page: EditorSubprocess;
}> = function ({
  model,
  act,
  page,
  egate,
  closeDialog,
  minimal,
  onDeleteClick,
  onFullEditClick,
  setSelectedNode,
}) {
  const measures = getModelAllMeasures(model);
  const id = egate.id;

  const [editing, setEditing] = useState<EditorEGate>({ ...egate });
  const [edges, setEdges] = useState<MMELEdge[]>(
    Object.values(page.edges).filter(e => e.from === id)
  );
  const [hasChange, setHasChange] = useState<boolean>(false);

  function onUpdateClick() {
    act(editEGateCommand(egate.id, page.id, editing, edges));
    if (closeDialog) {
      closeDialog();
    }
    setHasChange(false);
    if (setSelectedNode !== undefined && egate.id !== editing.id) {
      setSelectedNode(editing.id);
    }
  }

  function setEdit(x: EditorEGate) {
    setEditing(x);
    onChange();
  }

  function setEds(x: MMELEdge[]) {
    setEdges(x);
    onChange();
  }

  function onChange() {
    if (!hasChange) {
      setHasChange(true);
    }
  }

  function saveOnExit() {
    setHasChange(hc => {
      if (hc) {
        setEditing(edit => {
          setEdges(es => {
            act(editEGateCommand(egate.id, page.id, edit, es));
            return es;
          });
          return edit;
        });
      }
      return false;
    });
  }

  function onNewID(id: string) {
    act(editEGateCommand(egate.id, page.id, { ...editing, id }, edges));
    setHasChange(false);
    if (setSelectedNode !== undefined) {
      setSelectedNode(id);
    }
  }

  const fullEditClick =
    onFullEditClick !== undefined
      ? function () {
          if (hasChange) {
            onUpdateClick();
          }
          onFullEditClick();
        }
      : undefined;

  const commonProps: CommonEGateEditProps = {
    onUpdateClick,
    editing,
    setEditing,
    edges,
    setEdges,
    onDeleteClick,
    onFullEditClick: fullEditClick,
  };

  const fullEditProps = {
    closeDialog,
    measures,
  };

  const quickEditProps = {
    saveOnExit,
    egate,
    setEditing: setEdit,
    setEdges: setEds,
    initID: egate.id,
    validTest: (id: string) => id === egate.id || checkId(id, model.elements),
    onNewID,
    model,
  };

  useEffect(() => {
    setEditing(egate);
    setEdges([...Object.values(page.edges).filter(e => e.from === id)]);
  }, [egate]);
  useEffect(
    () => setEdges([...Object.values(page.edges).filter(e => e.from === id)]),
    [page.edges]
  );

  return minimal ? (
    <QuickVersionEdit {...commonProps} {...quickEditProps} />
  ) : (
    <FullVersionEdit {...commonProps} {...fullEditProps} />
  );
};

const QuickVersionEdit: React.FC<
  CommonEGateEditProps & {
    egate: EditorEGate;
    saveOnExit: () => void;
    onNewID: (id: string) => void;
    model: EditorModel;
  }
> = function (props) {
  const {
    model,
    editing,
    setEditing,
    edges,
    setEdges,
    egate,
    saveOnExit,
    onNewID,
  } = props;

  useEffect(() => saveOnExit, [egate]);

  function idTest(id: string) {
    return id === egate.id || checkId(id, model.elements);
  }

  const idButton = (
    <PopoverChangeIDButton
      initValue={editing.id}
      validTest={idTest}
      save={onNewID}
    />
  );

  return (
    <FormGroup>
      <EditPageButtons {...props} />
      <DescriptionItem
        label="Gateway ID"
        value={editing.id}
        extend={idButton}
      />
      <NormalTextField
        text="Label"
        value={editing.label}
        onChange={x => setEditing({ ...editing, label: x })}
      />
      {edges.map((edge, index) => (
        <EdgeQuickEdit
          edge={edge}
          index={index}
          setEdge={(x, edge) => {
            edges[x] = edge;
            setEdges([...edges]);
          }}
        />
      ))}
    </FormGroup>
  );
};

const FullVersionEdit: React.FC<
  CommonEGateEditProps & {
    closeDialog?: () => void;
    measures: string[];
  }
> = function (props) {
  const { editing, setEditing, edges, setEdges, measures } = props;
  return (
    <MGDDisplayPane>
      <FormGroup>
        <EditPageButtons {...props} />
        <NormalTextField
          text="Exclusive Gateway ID"
          value={editing.id}
          onChange={x => setEditing({ ...editing, id: removeSpace(x) })}
        />
        <NormalTextField
          text="Label"
          value={editing.label}
          onChange={x => setEditing({ ...editing, label: x })}
        />
        {edges.map((edge, index) => (
          <EditEdgePage
            key={edge.id}
            edge={edge}
            index={index}
            types={measures}
            setEdge={(x, edge) => {
              edges[x] = edge;
              setEdges([...edges]);
            }}
          />
        ))}
      </FormGroup>
    </MGDDisplayPane>
  );
};

const EditEdgePage: React.FC<{
  edge: MMELEdge;
  index: number;
  types: string[];
  setEdge: (x: number, edge: MMELEdge) => void;
}> = function ({ edge, index, types, setEdge }) {
  return (
    <fieldset>
      <legend>Edge to {edge.to}</legend>
      <div>
        <NormalTextField
          text="Description"
          value={edge.description}
          onChange={x => setEdge(index, { ...edge, description: x })}
        />
        <ReferenceSelector
          text="Condition"
          filterName="Measurement filter"
          editable={true}
          value={edge.condition}
          options={types}
          update={x =>
            setEdge(index, {
              ...edge,
              condition: edge.condition + '[' + types[x] + ']',
            })
          }
          onChange={x => setEdge(index, { ...edge, condition: x })}
        />
        <Button
          onClick={() =>
            setEdge(index, {
              ...edge,
              description: 'default',
              condition: 'default',
            })
          }
        >
          Set default
        </Button>
        <Button
          onClick={() =>
            setEdge(index, { ...edge, description: '', condition: '' })
          }
        >
          Set empty
        </Button>
      </div>
    </fieldset>
  );
};

export default EditEGatePage;
