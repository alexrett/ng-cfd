import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import typescript from "@rollup/plugin-typescript";

import postcss from "rollup-plugin-postcss";

export default [
    {
        input: "src/index.ts",
        output: {
            file: "dist/index.js",
            format: "cjs",
        },
        external: ["react", "react-dom"],
        plugins: [
            babel({
                presets: ["@babel/preset-env", "@babel/preset-react"],
                exclude: "node_modules/**",
            }),
            commonjs(),
            resolve(),
            typescript({ tsconfig: "./tsconfig.json" }),
            postcss({
                modules: true,
            }),
        ],
    },
];