const device = process.env.LHCI_DEVICE || "mobile";

/** @type {import('@lhci/cli').LighthouseCIConfig} */
module.exports = {
  ci: {
    collect: {
      url: [
        "http://127.0.0.1:3000/en",
        "http://127.0.0.1:3000/en/page-two",
      ],
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