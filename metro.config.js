// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// framer-motion (usado pelo moti no target web) importa tslib de um jeito
// que quebra com a resolução de "package.json#exports" do Metro (erro
// "Cannot destructure property '__extends' of 'tslib.default'"). Desativar
// aqui volta pra resolução por main/module, que é o que a maioria dos
// pacotes RN espera.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
