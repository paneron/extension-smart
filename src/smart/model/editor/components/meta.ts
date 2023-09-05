import { useReducer } from 'react';
import type { MMELMetadata } from '@paneron/libmmel/interface/supportinterface';
import type { UndoReducerInterface } from '@/smart/model/editor/interface';

interface EditAction {
  property: keyof MMELMetadata;
  value: string;
}

type EXPORT_ACTION = EditAction;
export type MetaAction = EXPORT_ACTION & { act: 'meta' };

interface InitAction {
  act: 'init';
  value: MMELMetadata;
}

type OwnAction = MetaAction | InitAction;

function reducer(m: MMELMetadata, action: OwnAction): MMELMetadata {
  if (action.act === 'init') {
    const newMeta = { ...action.value };
    return newMeta;
  } else {
    const newMeta = { ...m, [action.property] : action.value };
    return newMeta;
  }
}

function findReverse(meta: MMELMetadata, action: MetaAction): MetaAction {
  return { ...action, value : meta[action.property] ?? '' };
}

export function useMeta(
  x: MMELMetadata
): UndoReducerInterface<MMELMetadata, MetaAction> {
  const [meta, dispatchMeta] = useReducer(reducer, x);

  function act(action: MetaAction): MetaAction {
    dispatchMeta(action);
    return findReverse(meta, action);
  }

  function init(x: MMELMetadata) {
    dispatchMeta({ act : 'init', value : x });
  }

  return [meta, act, init];
}
