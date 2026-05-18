/** @type {import("dependency-cruiser").IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-shared-root-import",
      severity: "error",
      comment:
        "Import shared APIs through explicit subpath exports instead of the broad root barrel.",
      from: {
        path: "^packages/(?!shared/)",
      },
      to: {
        path: "^packages/shared/src/index\\.ts$",
      },
    },
    {
      name: "no-shared-internal-deep-import",
      severity: "error",
      comment:
        "Consumers may only depend on shared public subpath entrypoints or styles.",
      from: {
        path: "^packages/(?!shared/)",
      },
      to: {
        path: "^packages/shared/src/",
        pathNot:
          "^packages/shared/src/(notification|schedule|settings|storage|types|ui)/index\\.ts$|^packages/shared/src/styles/",
      },
    },
    {
      name: "ui-storage-platform-boundary-report",
      severity: "warn",
      comment:
        "Report-only until the settings/UI cleanup slice removes UI dependencies on storage and platform internals.",
      from: {
        path: "^packages/shared/src/(components|ui)/",
      },
      to: {
        path: "^packages/shared/src/(storage|utils/(platform|storage))",
      },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "types", "node", "default"],
    },
    tsConfig: {
      fileName: "tsconfig.json",
    },
    tsPreCompilationDeps: "specify",
  },
};
