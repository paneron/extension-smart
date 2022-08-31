module.exports = api => {
  const isTest = api.env('test'); // TODO: use isTest boolean where needed
  return {
    // logical assignment operators, e.g. `||=` , for nodejs 14.x
    plugins : ['@babel/plugin-proposal-logical-assignment-operators'],
    presets : [
      ['@babel/preset-env', { targets : { electron : '10' }}],
      '@babel/preset-typescript',
      '@babel/preset-react',
    ]
  };
};
