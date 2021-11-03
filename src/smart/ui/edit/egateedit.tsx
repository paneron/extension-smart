import { FormGroup } from '@blueprintjs/core';
import React, { useEffect, useState } from 'react';
import MGDButton from '../../MGDComponents/MGDButton';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
import {
  EditorEGate,
  EditorModel,
  EditorSubprocess,
} from '../../model/editormodel';
import { ModelWrapper } from '../../model/modelwrapper';
import { MMELEdge } from '../../serialize/interface/flowcontrolinterface';
import {
  checkId,
  getModelAllMeasures,
  removeSpace,
  updatePageElement,
} from '../../utils/ModelFunctions';
import { DescriptionItem } from '../common/description/fields';
import { NormalTextField, ReferenceSelector } from '../common/fields';
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
  modelWrapper: ModelWrapper;
  setModel: (m: EditorModel) => void;
  id: string;
  closeDialog?: () => void;
  minimal?: boolean;
  onFullEditClick?: () => void;
  onDeleteClick?: () => void;
  getLatestLayoutMW?: () => ModelWrapper;
  setSelectedNode?: (id: string) => void;
}> = function ({
  modelWrapper,
  setModel,
  id,
  closeDialog,
  minimal,
  onDeleteClick,
  onFullEditClick,
  getLatestLayoutMW,
  setSelectedNode,
}) {
  const model = modelWrapper.model;
  const page = model.pages[modelWrapper.page];

  const egate = model.elements[id] as EditorEGate;
  const measures = getModelAllMeasures(model);

  const [editing, setEditing] = useState<EditorEGate>({ ...egate });
  const [edges, setEdges] = useState<MMELEdge[]>(
    Object.values(page.edges).filter(e => e.from === id)
  );
  const [hasChange, setHasChange] = useState<boolean>(false);

  function onUpdateClick() {
    const updated = save(id, editing, modelWrapper.page, model, edges);
    if (updated !== null) {
      setModel({ ...updated });
      if (closeDialog !== undefined) {
        closeDialog();
      }
    }
    setHasChange(false);
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
            const updated = save(id, edit, modelWrapper.page, model, es);
            if (updated !== null) {
              setModel({ ...updated });
            }
            return es;
          });
          return edit;
        });
      }
      return false;
    });
  }

  function onNewID(id: string) {
    const oldid = egate.id;
    if (getLatestLayoutMW !== undefined) {
      const mw = getLatestLayoutMW();
      const updated = save(
        oldid,
        { ...editing, id },
        modelWrapper.page,
        mw.model,
        edges
      );
      if (updated !== null) {
        setModel({ ...updated });
      }
      setHasChange(false);
      if (setSelectedNode !== undefined) {
        setSelectedNode(id);
      }
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
  }
> = function (props) {
  const { editing, setEditing, edges, setEdges, egate, saveOnExit } = props;

  useEffect(() => saveOnExit, [egate]);

  return (
    <FormGroup>
      <EditPageButtons {...props} />
      <DescriptionItem label="Gateway ID" value={editing.id} />
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
        <MGDButton
          onClick={() =>
            setEdge(index, {
              ...edge,
              description: 'default',
              condition: 'default',
            })
          }
        >
          Set default
        </MGDButton>
        <MGDButton
          onClick={() =>
            setEdge(index, { ...edge, description: '', condition: '' })
          }
        >
          Set empty
        </MGDButton>
      </div>
    </fieldset>
  );
};

function save(
  oldId: string,
  egate: EditorEGate,
  pageid: string,
  model: EditorModel,
  edges: MMELEdge[]
): EditorModel | null {
  const page = model.pages[pageid];
  if (oldId !== egate.id) {
    if (checkId(egate.id, model.elements)) {
      updateEdges(page, edges);
      delete model.elements[oldId];
      updatePageElement(page, oldId, egate);
      model.elements[egate.id] = egate;
    } else {
      return null;
    }
  } else {
    updateEdges(page, edges);
    model.elements[oldId] = egate;
  }
  return model;
}

function updateEdges(page: EditorSubprocess, edges: MMELEdge[]) {
  for (const edge of edges) {
    page.edges[edge.id] = edge;
  }
  page.edges = { ...page.edges };
}

export default EditEGatePage;
