module.exports = api => {
  const isTest = api.env('test'); // TODO: use isTest boolean where needed
  return {
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }],
      '@babel/preset-typescript',
    ]
  };
};
