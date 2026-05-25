import app from "./app";
import { logger } from "./lib/logger";
import { syncInitialCredits } from "./services/credits.js";

const rawPort = process.env["PORT"];
const port = rawPort ? Number(rawPort) : 8080;

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Bump any pre-existing profiles that were created before the 70-credit
  // policy. Safe on every restart — no-op once all rows are up to date.
  syncInitialCredits()
    .then(() => logger.info("syncInitialCredits: done"))
    .catch((e) => logger.error({ err: e }, "syncInitialCredits: failed"));
});
