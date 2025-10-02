import core from "@actions/core";
import axios from "axios";
import send from "./send.js";

async function validateSubscription() {
  const API_URL = `https://agent.api.stepsecurity.io/v1/github/${process.env.GITHUB_REPOSITORY}/actions/subscription`;

  try {
    await axios.get(API_URL, { timeout: 3000 });
  } catch (error) {
    if (error.response && error.response.status === 403) {
      core.error(
        "Subscription is not valid. Reach out to support@stepsecurity.io",
      );
      process.exit(1);
    } else {
      core.info("Timeout or API not reachable. Continuing to next step.");
    }
  }
}
/**
 * Invoke the Slack GitHub Action job from this file but export actual logic
 * from the send.js file for testing purposes.
 */
try {
  await validateSubscription();
  await send(core);
} catch (error) {
  if (error instanceof Error) {
    core.error(error.message);
    /** @type {import('./errors.js').Cause} */
    const causes = /** @type {any} */ (error.cause);
    if (causes?.values) {
      for (const cause of causes.values) {
        core.info(`${cause.stack}`);
      }
    } else {
      core.info(`${error.stack}`);
    }
  } else {
    core.error(`${error}`);
  }
  throw error;
}
