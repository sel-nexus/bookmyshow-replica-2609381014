import { createApp } from "./app";
import { config } from "./config";

/**
 * Server bootstrap.
 *
 * Creates the Express app and binds it to the configured port. Kept thin so
 * the app module stays importable by tests without starting a listener.
 */
function main(): void {
  const app = createApp();
  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`BookMyShow backend listening on port ${config.port}`);
  });
}

main();
