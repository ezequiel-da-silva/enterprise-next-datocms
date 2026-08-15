const device = process.env.LHCI_DEVICE || "mobile";
const { urls } = require("./lighthouse-paths.cjs");

/** @type {import('@lhci/cli').LighthouseCIConfig} */
module.exports = {
  ci: {
    collect: {
      url: urls,
      startServerCommand: "npm run start:standalone",
      startServerReadyPattern: "Ready",
      numberOfRuns: 3,
      settings: device === "desktop" ? { preset: "desktop" } : {},
    },
    assert: {
      assertions: {
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:performance": [
          "warn",
          { minScore: device === "desktop" ? 0.85 : 0.65 },
        ],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
