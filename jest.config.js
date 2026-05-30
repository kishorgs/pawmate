/** Root Jest config — coverage gate/threshold for SDLCM (backend tests). */
module.exports = {
  projects: ['<rootDir>/apps/backend'],
  coverageThreshold: {
    global: {
      branches: 3,
      functions: 2,
      lines: 3,
      statements: 3,
    },
  },
};
