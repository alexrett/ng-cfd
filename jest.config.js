const esModules = ['d3', 'd3-axis', 'd3-scale', 'internmap', 'delaunator', 'robust-predicates'].join('|');


module.exports = {
    testEnvironment: "jsdom",
    moduleNameMapper: {
        ".(css|less|scss)$": "identity-obj-proxy",
    },
    transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
};