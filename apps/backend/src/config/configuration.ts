import { existsSync, readFileSync } from 'fs';
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

function resolveConfigFile(): string {
  const candidates = [
    join(process.cwd(), 'config/default.json'),
    join(process.cwd(), '../../config/default.json'),
  ];
  const found = candidates.find((path) => existsSync(path));
  if (!found) {
    throw new Error('config/default.json not found');
  }
  return found;
}

export default (): PawmateConfig => {
  const defaults = JSON.parse(
    readFileSync(resolveConfigFile(), 'utf8'),
  ) as PawmateConfig;

  return {
    app: defaults.app,
    server: {
      port: Number(process.env.PORT ?? defaults.server.port),
      corsOrigin: process.env.CORS_ORIGIN ?? defaults.server.corsOrigin,
    },
  };
};
