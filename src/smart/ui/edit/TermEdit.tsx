/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { FormGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import { LocalizedConceptForm } from '@riboseinc/paneron-extension-glossarist/classes/localizedConcept/LocalizedConceptForm';
import React from 'react';
import { EditorModel } from '../../model/editormodel';
import { MMELTerm } from '../../serialize/interface/supportinterface';
import { checkId, defaultItemSorter } from '../../utils/ModelFunctions';
import { createTerm } from '../../utils/EditorFactory';
import { IListItem, IManageHandler, NormalTextField } from '../common/fields';
import ListManagePage from '../common/listmanagement/listmanagement';
import StringListQuickEdit from './components/StringListQuickEdit';

const TermsEditPage: React.FC<{
  model: EditorModel;
  setModel: (model: EditorModel) => void;
}> = function ({ model, setModel }) {
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
      .map(x => ({ id: x.id, text: [x.term, ...x.admitted].join(' / ') }))
      .sort(defaultItemSorter);
  }

  function removeTermListItem(ids: string[]) {
    for (const id of ids) {
      delete model.terms[id];
    }
    setModel(model);
  }

  function addTerm(term: MMELTerm): boolean {
    if (checkId(term.id, model.terms)) {
      model.terms[term.id] = term;
      setModel(model);
      return true;
    }
    return false;
  }

  function updateTerm(oldid: string, term: MMELTerm): boolean {
    if (oldid !== term.id) {
      if (checkId(term.id, model.terms)) {
        delete model.terms[oldid];
        model.terms[term.id] = term;
        setModel(model);
        return true;
      }
      return false;
    } else {
      model.terms[term.id] = term;
      setModel(model);
      return true;
    }
  }

  function getTermById(id: string): MMELTerm {
    const term = model.terms[id];
    if (term === undefined) {
      return createTerm('');
    }
    return term;
  }

  const termhandler: IManageHandler<MMELTerm> = {
    filterName: 'Term filter',
    itemName: 'Terms',
    Content: TermEditItemPage,
    initObj: createTerm(''),
    model,
    getItems: getTermListItems,
    removeItems: removeTermListItem,
    addItem: obj => addTerm(obj),
    updateItem: (oldid, obj) => updateTerm(oldid, obj),
    getObjById: getTermById,
  };

  return <ListManagePage {...termhandler} />;
};

const TermEditItemPage: React.FC<{
  object: MMELTerm;
  setObject: (obj: MMELTerm) => void;
}> = ({ object: term, setObject: setTerm }) => {
  return (
    <FormGroup>
      <LocalizedConceptForm
        localizedConcept={{ terms: [], definition: '', notes: [], examples: [], authoritativeSource: [] }}
        writingDirectionality="LTR"
      />
      <NormalTextField
        text="Term ID"
        value={term.id}
        onChange={x => setTerm({ ...term, id: x.replaceAll(/\s+/g, '') })}
      />
      <NormalTextField
        text="Term"
        value={term.term}
        onChange={x => setTerm({ ...term, term: x })}
      />
      <StringListQuickEdit
        data={term.admitted}
        setData={x => setTerm({ ...term, admitted: x })}
        label="Admitted term"
        addButtonLabel="Add admitted term"
      />
      <NormalTextField
        text="Definition"
        value={term.definition}
        onChange={x => setTerm({ ...term, definition: x })}
      />
      <StringListQuickEdit
        data={term.notes}
        setData={x => setTerm({ ...term, notes: x })}
        label="Note"
        addButtonLabel="Add note"
      />
    </FormGroup>
  );
};

export default TermsEditPage;
