/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React, { useState } from 'react';
import { useStoreActions } from 'react-flow-renderer';
import { EditorEGate, EditorModel, EditorSubprocess } from '../../model/editormodel';
import { ModelWrapper } from '../../model/modelwrapper';
import { MMELEdge } from '../../serialize/interface/flowcontrolinterface';
import { checkId, getModelAllMeasures, removeSpace, updatePageElement } from '../../utils/commonfunctions';
import { NormalTextField, ReferenceSelector } from '../common/fields';
import { EditPageButtons } from './commons';

const EditEGatePage: React.FC<{
  modelwrapper: ModelWrapper;
  setModel: (m: EditorModel) => void;
  id: string;
  closeDialog: () => void;
}> = function ({ modelwrapper, setModel, id, closeDialog }) {
  const setElm = useStoreActions(act => act.setSelectedElements);
  
  const model = modelwrapper.model;
  const page = model.pages[modelwrapper.page];

  const egate = model.elements[id] as EditorEGate;
  const measures = getModelAllMeasures(model);

  const [editing, setEditing] = useState<EditorEGate>({ ...egate });
  const [edges, setEdges] = useState<MMELEdge[]>(Object.values(page.edges).filter(e => e.from === id));

  function onUpdateClick() {
    const updated = save(
      id,
      editing,
      modelwrapper.page,
      model,
      edges
    );
    if (updated !== null) {
      setElm([]);
      setModel({ ...updated });
      closeDialog();
    }
  }

  return (
    <>
      <EditPageButtons
        onUpdateClick={onUpdateClick}
        onCancelClick={closeDialog}
      />      
      <NormalTextField
        key="field#egateID"
        text="Exclusive Gateway ID"
        value={editing.id}
        onChange={x => setEditing({ ...editing, id: removeSpace(x) })}
      />    
      <NormalTextField
        key="field#egateLabel"
        text="Label"
        value={editing.label}
        onChange={x => setEditing({ ...editing, label: x })}
      />
      {edges.map((edge, index) => (
        <EditEdgePage
          edge={edge}
          index={index}
          types={measures}
          setEdge={(x, edge) => {            
            edges[x] = edge;
            setEdges([ ...edges ]);
          }}
        />
      ))}
    </>
  );
};

const EditEdgePage: React.FC<{
  edge: MMELEdge;
  index: number;
  types: string[];
  setEdge: (x: number, edge:MMELEdge) => void;
}> = function ({ edge, index, types, setEdge }) {
  return (
    <fieldset>
      <legend>Edge to {edge.to}</legend>
      <div key={'field#edgeConditionLabel#' + index}>
        <NormalTextField
          key={'field#edgeCondition#' + index}
          text="Description"
          value={ edge.description }
          onChange={x => setEdge(index, {...edge, description:x})}
        />
        <ReferenceSelector
          key="field#edgeCondition"
          text="Condition"
          filterName="Measurement filter"
          editable={true}
          value={edge.condition}
          options={types}
          update={x => 
            setEdge(index, { ...edge, condition: edge.condition + '[' + types[x] + ']'})
          }
          onChange={x =>
            setEdge(index, { ...edge, condition: x })
          }
        />
        <Button
          key={'defaultbutton#edgeCondition#' + index}
          text='Set default'
          onClick={() => setEdge(index, { ...edge, description: 'default', condition: 'default' }) }
        />
        <Button
          key={'emptybutton#edgeCondition#' + index}
          text='Set empty'
          onClick={() => setEdge(index, { ...edge, description: '', condition: '' })}
        />        
      </div>
    </fieldset>
  );
}

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
}

export default EditEGatePage;
