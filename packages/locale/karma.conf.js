/*
 * @copyright (c) 2017, Philipp Thuerwaechter & Pattrick Hueper
 * @license BSD-3-Clause (see LICENSE.md in the root directory of this source tree)
 */

const path = require('path');
const { updateWebpackConfigForLocales } = require('./utils/buildWebpackConfig');
const { sauceLabsMetaData, sauceLabsLaunchers } = require('../../shared/saucelabs');

module.exports = function (config) {
    // eslint-disable-next-line global-require
    let webpackConfig = require('./webpack.config.js')();
    // for the karma test runs, we don't want to have any externals,
    // especially js-joda and others should be included!
    webpackConfig.externals = undefined;
    // clear entry, for karma we use the karmaWebpackTestEntry
    webpackConfig.entry = undefined;
    // no sourceMaps for karma build (seems to cause problems with saucelabs runs?)
    webpackConfig.devtool = false;

    // add cldr-data load workaround
    webpackConfig.resolve = {
        alias: {
            'cldr-data$': path.resolve(__dirname, 'test/utils/karma_cldrData.js'),
        }
    };

    const locales = ['en', 'en-GB', 'en-CA', 'de', 'fr']; // these are required for tests
    webpackConfig = updateWebpackConfigForLocales(webpackConfig, locales, `${__dirname}/node_modules`);

    config.set({
        files: [
            { pattern: 'test/karmaWebpackTestEntry.js' },
        ],
        frameworks: [
            'mocha',
            'chai',
        ],
        preprocessors: {
            'test/karmaWebpackTestEntry.js': ['webpack'],
        },
        webpack: webpackConfig,
        webpackMiddleware: {
            quiet: true,
            noInfo: true,
        },
        sauceLabs: sauceLabsMetaData('@js-joda/locale'),
        customLaunchers: sauceLabsLaunchers,
        browserDisconnectTimeout: 10000, // default 2000
        // browserDisconnectTolerance: 1, // default 0
        browserNoActivityTimeout: 4 * 60 * 1000, // default 10000
        captureTimeout: 4 * 60 * 1000, // default 60000
        reporters: ['progress'],
        browsers: ['ChromeHeadless', 'FirefoxHeadless'],
        plugins: ['karma-*'],
    });
};
