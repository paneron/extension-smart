import { FormGroup } from '@blueprintjs/core';
// import { LocalizedConceptForm } from '@riboseinc/paneron-extension-glossarist/classes/localizedConcept/LocalizedConceptForm';
import React from 'react';
import type { EditorModel } from '@/smart/model/editormodel';
import type { MMELTerm } from '@paneron/libmmel/interface/supportinterface';
import { checkId, defaultItemSorter } from '@/smart/utils/ModelFunctions';
import { createTerm } from '@/smart/utils/EditorFactory';
import type { IListItem, IManageHandler } from '@/smart/ui/common/fields';
import { NormalTextField } from '@/smart/ui/common/fields';
import ListManagePage from '@/smart/ui/common/listmanagement/listmanagement';
import StringListQuickEdit from '@/smart/ui/edit/components/StringListQuickEdit';
import type { ModelAction } from '@/smart/model/editor/model';

const TermsEditPage: React.FC<{
  model: EditorModel;
  act: (x: ModelAction) => void;
}> = function ({ model, act }) {
  function matchFilter(term: MMELTerm, filter: string) {
    return (
      filter === '' ||
      term.term.toLowerCase().includes(filter) ||
      term.definition.toLowerCase().includes(filter) ||
      term.admitted.reduce<boolean>(
        (r, x) => r || x.toLowerCase().includes(filter),
        false
      ) ||
      term.notes.reduce<boolean>(
        (r, x) => r || x.toLowerCase().includes(filter),
        false
      )
    );
  }

  function getTermListItems(filter: string): IListItem[] {
    return Object.values(model.terms)
      .filter(x => matchFilter(x, filter))
      .map(x => ({ id : x.id, text : [x.term, ...x.admitted].join(' / ') }))
      .sort(defaultItemSorter);
  }

  function removeTermListItem(ids: string[]) {
    const action: ModelAction = {
      type  : 'model',
      act   : 'terms',
      task  : 'delete',
      value : ids,
    };
    act(action);
  }

  function addTerm(term: MMELTerm): boolean {
    if (checkId(term.id, model.terms)) {
      const action: ModelAction = {
        type  : 'model',
        act   : 'terms',
        task  : 'add',
        value : [term],
      };
      act(action);
      return true;
    }
    return false;
  }

  function updateTerm(oldid: string, term: MMELTerm): boolean {
    if (oldid !== term.id && !checkId(term.id, model.terms)) {
      return false;
    }
    const action: ModelAction = {
      type  : 'model',
      act   : 'terms',
      task  : 'edit',
      id    : oldid,
      value : term,
    };
    act(action);
    return true;
  }

  function getTermById(id: string): MMELTerm {
    const term = model.terms[id];
    if (term === undefined) {
      return createTerm('');
    }
    return term;
  }

  const termhandler: IManageHandler<MMELTerm> = {
    filterName  : 'Term filter',
    itemName    : 'Terms',
    Content     : TermEditItemPage,
    initObj     : createTerm(''),
    model,
    getItems    : getTermListItems,
    removeItems : removeTermListItem,
    addItem     : obj => addTerm(obj),
    updateItem  : (oldid, obj) => updateTerm(oldid, obj),
    getObjById  : getTermById,
  };

  return <ListManagePage {...termhandler} />;
};

const TermEditItemPage: React.FC<{
  object: MMELTerm;
  setObject: (obj: MMELTerm) => void;
}> = ({ object: term, setObject: setTerm }) => {
  return (
    <FormGroup>
      {/* <LocalizedConceptForm
        localizedConcept={{
          terms: [],
          definition: '',
          notes: [],
          examples: [],
          authoritativeSource: [],
        }}
        writingDirectionality="LTR"
      /> */}
      <NormalTextField
        text="Term ID"
        value={term.id}
        onChange={x => setTerm({ ...term, id : x.replaceAll(/\s+/g, '') })}
      />
      <NormalTextField
        text="Term"
        value={term.term}
        onChange={x => setTerm({ ...term, term : x })}
      />
      <StringListQuickEdit
        data={term.admitted}
        setData={x => setTerm({ ...term, admitted : x })}
        label="Admitted term"
        addButtonLabel="Add admitted term"
      />
      <NormalTextField
        text="Definition"
        value={term.definition}
        onChange={x => setTerm({ ...term, definition : x })}
      />
      <StringListQuickEdit
        data={term.notes}
        setData={x => setTerm({ ...term, notes : x })}
        label="Note"
        addButtonLabel="Add note"
      />
    </FormGroup>
  );
};

export default TermsEditPage;
