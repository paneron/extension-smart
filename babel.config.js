module.exports = api => {
  const isTest = api.env('test'); // TODO: use isTest boolean where needed
  return {
    exclude : [
      '*.test.*',
      '**/*.test.*'
    ],
    ignore : [
      '*.test.*',
      '**/*.test.*'
    ],
    compact : true,
    // logical assignment operators, e.g. `||=` , for nodejs 14.x
    plugins : [
      '@babel/plugin-proposal-logical-assignment-operators',
      '@babel/plugin-transform-typescript',
    ],
    presets : [
      ['@babel/preset-env', { targets : { electron : '10' }}],
      ['@babel/preset-typescript', { isTSX : true, allExtensions : true }],
      ['@babel/preset-react', { flow : false, typescript : true }],
    ]
  };
};
