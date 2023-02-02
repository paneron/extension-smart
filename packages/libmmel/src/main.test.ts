import { textToMMEL, MMELToText } from '@'

const sampleText = `root Root

version "v0.0.1-dev1"

metadata {
  title "Test title"
  schema "Test Schema v1.0.0-dev1"
  edition "2023"
  author "Ribose"
  shortname "TEST 12345"
  namespace "TEST12345"
}

subprocess Root {
}
`;

const sampleMMEL = {
  comments : {},
  elements : {},
  enums    : {},
  figures  : {},
  links    : {},
  meta     : {
    author    : 'Ribose',
    datatype  : 'metadata',
    edition   : '2023',
    namespace : 'TEST12345',
    schema    : 'Test Schema v1.0.0-dev1',
    shortname : 'TEST 12345',
    title     : 'Test title'
  },
  notes : {},
  pages : {
    Root : {
      childs   : {},
      data     : {},
      datatype : 'subprocess',
      edges    : {},
      id       : 'Root',
    },
  },
  provisions : {},
  refs       : {},
  roles      : {},
  root       : 'Root',
  sections   : {},
  tables     : {},
  terms      : {},
  vars       : {},
  version    : 'v0.0.1-dev1',
  views      : {},
};

test('textToMMEL converts schema version correctly', () => {
  expect(textToMMEL(sampleText).meta.schema).toBe(sampleMMEL.meta.schema);
});

