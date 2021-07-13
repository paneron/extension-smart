import { SupportedLanguage } from './lang';


export type CatalogPresetName = 'all' | 'current-proposal';

export type ObjectSource =
  { type: 'collection', collectionID: string } |
  { type: 'change-request', crID: string } |
  { type: 'catalog-preset', presetName: CatalogPresetName };

export interface ConceptQuery {
  // TODO: Make querying more flexible via a tree of predicates.
  
  onlyIDs?: number[]
  inSource?: ObjectSource
  matchingText?: string
  localization?: {
    lang: SupportedLanguage
    status: 'missing' | 'possiblyOutdated'
  }
}
