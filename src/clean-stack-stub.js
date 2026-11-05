const escapeStringRegexp = require("escape-string-regexp");

const extractPathRegex = /\s+at.*[(\s](.*)\)?/;
const pathRegex = /^(?:(?:(?:node|node:[\w/]+|(?:(?:node:)?internal\/[\w/]*|.*node_modules\/(?:babel-polyfill|pirates)\/.*)?\w+)(?:\.js)?:\d+:\d+)|native)/;

export default function cleanStack(stack, { pretty = false, basePath, pathFilter } = {}) {
  const basePathRegex = basePath && new RegExp(`(file://)?${escapeStringRegexp(basePath.replace(/\\/g, "/"))}/?`, "g");

  if (typeof stack !== "string") {
    return undefined;
  }

  return stack.replace(/\\/g, "/")
    .split("\n")
    .filter((line) => {
      const pathMatches = line.match(extractPathRegex);
      if (pathMatches === null || !pathMatches[1]) {
        return true;
      }

      const match = pathMatches[1];

      return pathFilter ? !pathRegex.test(match) && pathFilter(match) : !pathRegex.test(match);
    })
    .filter((line) => line.trim() !== "")
    .map((line) => {
      if (basePathRegex) {
        line = line.replace(basePathRegex, "");
      }

      return line;
    })
    .join("\n");
}
