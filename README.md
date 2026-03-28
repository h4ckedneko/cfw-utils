# cfw-utils

[![npm version](https://img.shields.io/npm/v/cfw-utils.svg)](https://www.npmjs.com/package/cfw-utils)
[![license](https://img.shields.io/npm/l/cfw-utils.svg)](https://github.com/h4ckedneko/cfw-utils/blob/main/LICENSE)

A set of utility functions for working with Cloudflare Workers platform.

## Install

```bash
npm install cfw-utils
```

```bash
pnpm add cfw-utils
```

```bash
yarn add cfw-utils
```

Alternatively, you can also just copy and paste the utilities in [src/utils](src/utils) to your project.

## Workflows Utilities

### `configureStep` and `runStep`

Simplifies running workflow steps with shared default configuration and centralized error handling.

#### Features

- **Default Config** - Apply your timeout and retries config across all steps (can be overridden per step)
- **Error Handling** - Automatically execute cleanup logic when any step fails
- **Familiar API** - Mirrors Cloudflare's `step.do` signature

#### Example

```typescript
export class Workflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const { runStep } = configureStep(step, {
      // Default config applied to all steps (can be overridden per step).
      defaultConfig: {
        retries: {
          limit: 10,
          delay: 1000,
          backoff: "exponential",
        },
        timeout: "5 minutes",
      },
      // Cleanup logic invoked when any step fails.
      onError: async (error) => {
        await setAsFailed();
        console.error(error);
      },
    });

    // Run a step with default configuration.
    const result = await runStep("fetch data", async () => {
      return await fetch("https://example.com").then(r => r.json());
    });

    // Run a step with overridden timeout (other defaults still apply).
    await runStep("process data", { timeout: "30 minutes" }, async () => {
      await saveToDb(result);
    });
  }
}
```

## License

MIT © [Lyntor Paul Figueroa](https://github.com/h4ckedneko)
