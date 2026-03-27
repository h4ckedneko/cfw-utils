# Cloudflare Workers Utilities

A set of utility functions for Cloudflare Workers.

## Installation

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

## Usage

### configureStep()

A reusable step runner for Cloudflare Workflows. Simplifies running workflow steps with shared default configuration and centralized error handling.

#### Features

- **Default config** - Apply consistent timeout, retries, or other settings across all steps
- **Error handling** - Automatically execute cleanup logic when any step fails
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
      // Cleanup logic executed when any step fails.
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
