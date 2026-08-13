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
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        "categories:accessibility": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],
        "categories:performance": ["warn", { minScore: 0.75 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
