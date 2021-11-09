import { build, BuildOptions } from "esbuild";
import chalk from "chalk";
import consola from "consola";
import { PreserveExternalPlugin } from "./preserve-external-dep.plugin";

const isProd = process.env.NODE_ENV === "production";

async function main() {
  const sharedBuildOptions: BuildOptions = {
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV ?? "development"
      ),
    },
    bundle: true,
    minify: isProd,
    sourcemap: false,
    platform: "browser",
    target: ["es2020", "chrome58"],
  };

  const preMountContent = `
window.React = require('react');
window.ReactDOM = require('react-dom')`;

  await build({
    stdin: {
      contents: preMountContent,
      resolveDir: __dirname,
    },
    outfile: "./public/inject.js",
    ...sharedBuildOptions,
  });

  await build({
    entryPoints: ["./src/index.tsx"],
    outdir: "public",
    plugins: [
      PreserveExternalPlugin({
        depsToExtract: [
          {
            dep: "react",
            content: "module.exports = React",
          },
          {
            dep: "react-dom",
            content: "module.exports = ReactDOM",
          },
        ],
      }),
    ],
    external: ["react", "react-dom"],
    loader: {
      ".html": "text",
      ".svg": "dataurl",
    },
    tsconfig: "tsconfig.json",
    ...sharedBuildOptions,
  });
}

(async () => {
  await main();
})();
