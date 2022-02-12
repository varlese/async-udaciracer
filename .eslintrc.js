/*eslint quotes: ["error", "double"]*/

module.exports = {
    "env": {
        "browser": true,
        "node": true,
        "es2021": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 13,
        "sourceType": "module"
    },
    "rules": {
        "no-unused-vars": 0,
        "semi": [ 2, "never" ],
        "quotes": [ "error", "single" ],
        "space-in-parens": [ "error", "always" ],
        "array-bracket-spacing": [ "error", "always" ],
        "object-curly-spacing": [ "error", "always" ],
        "no-cond-assign": [ 0, "never" ]
    }
}