import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import { EditorModel } from '../../model/editormodel';
import { MMELReference } from '../../serialize/interface/supportinterface';
import {
  checkId,
  referenceSorter,
  toRefSummary,
} from '../../utils/ModelFunctions';
import { createReference } from '../../utils/EditorFactory';
import { IListItem, IManageHandler, NormalTextField } from '../common/fields';
import ListManagePage from '../common/listmanagement/listmanagement';
import { ModelAction } from '../../model/editor/model';
import {
  addRefCommand,
  delRefCommand,
  editRefCommand,
} from '../../model/editor/commands/reference';

const ReferenceEditPage: React.FC<{
  model: EditorModel;
  act: (x: ModelAction) => void;
}> = function ({ model, act }) {
  function matchFilter(ref: MMELReference, filter: string) {
    return (
      filter === '' ||
      ref.id.toLowerCase().includes(filter) ||
      ref.document.toLowerCase().includes(filter) ||
      ref.clause.toLowerCase().includes(filter)
    );
  }

  function getRefListItems(filter: string): IListItem[] {
    return Object.values(model.refs)
      .filter(x => matchFilter(x, filter))
      .sort(referenceSorter)
      .map(x => ({ id : x.id, text : toRefSummary(x) }));
  }

  function removeRefListItem(ids: string[]) {
    act(delRefCommand(ids));
  }

  function addRef(ref: MMELReference): boolean {
    if (ref.clause.includes(',')) {
      const failed: string[] = [];
      const clauses = ref.clause.split(',').map(x => x.trim());
      const newRefs: MMELReference[] = [];
      const newIDs = new Set<string>();
      for (const c of clauses) {
        const id = ref.id + c.replaceAll('.', '-');
        if (model.refs[id] === undefined && !newIDs.has(id)) {
          const newref = createReference(id);
          newref.document = ref.document;
          newref.clause = c;
          newRefs.push(newref);
          newIDs.add(id);
        } else {
          failed.push(c);
        }
      }
      if (failed.length > 0) {
        alert(
          'The following clauses cannot be added because ' +
          `their IDs already exist: ${failed.join(', ')}`
        );
        return false;
      }
      act(addRefCommand(newRefs));
      return true;
    } else {
      if (checkId(ref.id, model.refs)) {
        act(addRefCommand([ref]));
        return true;
      }
    }
    return false;
  }

  function updateRef(oldid: string, ref: MMELReference): boolean {
    if (oldid !== ref.id && !checkId(ref.id, model.refs)) {
      return false;
    }
    act(editRefCommand(oldid, ref));
    return true;
  }

  function getRefById(id: string): MMELReference {
    const ref = model.refs[id];
    if (ref === undefined) {
      return createReference('');
    }
    return ref;
  }

  const refhandler: IManageHandler<MMELReference> = {
    filterName  : 'Reference filter',
    itemName    : 'References',
    Content     : ReferenceEditItemPage,
    initObj     : createReference(''),
    model       : model,
    getItems    : getRefListItems,
    removeItems : removeRefListItem,
    addItem     : obj => addRef(obj),
    updateItem  : (oldid, obj) => updateRef(oldid, obj),
    getObjById  : getRefById,
  };

  return <ListManagePage {...refhandler} />;
};

const ReferenceEditItemPage: React.FC<{
  object: MMELReference;
  setObject: (obj: MMELReference) => void;
}> = ({ object: ref, setObject: setRef }) => {
  return (
    <FormGroup>
      <p>
        You may insert multiple clauses at once.
        Seperate the cluase by &quot;,&quot;.
        IDs of the references will be automatically generated according to the
        clause numbers.
        For example, clause 4.1.1 with ID &quot;ref&quot; will become
        &quot;ref4-1-1&quot;.
      </p>
      <NormalTextField
        text="Reference ID"
        value={ref.id}
        onChange={x => setRef({ ...ref, id : x.replaceAll(/\s+/g, '') })}
      />
      <NormalTextField
        text="Document"
        value={ref.document}
        onChange={x => setRef({ ...ref, document : x })}
      />
      <NormalTextField
        text="Clause"
        value={ref.clause}
        onChange={x => setRef({ ...ref, clause : x })}
      />
      <NormalTextField
        text="Title"
        value={ref.title}
        onChange={x => setRef({ ...ref, title : x })}
      />
    </FormGroup>
  );
};

export default ReferenceEditPage;
