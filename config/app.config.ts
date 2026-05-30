import { readFileSync } from 'fs';
import { join } from 'path';

export interface PawmateConfig {
  app: {
    name: string;
    apiPrefix: string;
  };
  server: {
    port: number;
    corsOrigin: string;
  };
}

export function loadRootConfig(): PawmateConfig {
  const configDir = join(__dirname);
  const defaults = JSON.parse(
    readFileSync(join(configDir, 'default.json'), 'utf8'),
  ) as PawmateConfig;

  return {
    app: defaults.app,
    server: {
      port: Number(process.env.PORT ?? defaults.server.port),
      corsOrigin: process.env.CORS_ORIGIN ?? defaults.server.corsOrigin,
    },
  };
}
