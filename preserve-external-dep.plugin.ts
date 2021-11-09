import { Plugin } from "esbuild";
import { capitalCase } from "capital-case";

interface IOptions {
  depsToExtract: Array<{
    dep: string;
    content?: string;
    // TODO:
    // contentFunc?: (dep: string) => string;
  }>;
}

export const PreserveExternalPlugin = (options: IOptions): Plugin => {
  const NAMESPACE = "preserved-external-deps";

  const filterRE = new RegExp(
    `^(${options.depsToExtract
      .map((str) => str.dep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|")})$`
  );
  console.log("filterRE: ", filterRE);

  return {
    name: "PreserveExternal",
    setup(build) {
      build.onResolve({ filter: filterRE }, ({ path }) => {
        return {
          path,
          namespace: NAMESPACE,
        };
      });

      // for (const { dep, content } of options.depsToExtract) {
      //   build.onLoad(
      //     { filter: new RegExp(`^${dep}$`), namespace: NAMESPACE },
      //     () => {
      //       return {
      //         contents: content,
      //       };
      //     }
      //   );
      // }

      build.onLoad({ filter: /^react$/, namespace: NAMESPACE }, () => {
        return {
          contents: "module.exports = React",
        };
      });
      build.onLoad({ filter: /^react-dom$/, namespace: NAMESPACE }, () => {
        return {
          contents: "module.exports = ReactDOM",
        };
      });
    },
  };
};

async function main() {}
