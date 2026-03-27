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

### configureStep

A reusable step runner for Cloudflare Workflows. Simplifies running workflow steps with shared default configuration and centralized error handling.

#### Features

- **Default config** - Apply consistent timeout, retries, or other settings across all steps
- **Error handling** - Automatically execute cleanup logic when any step fails
- **Familiar API** - Mirrors Cloudflare's `step.do` signature

#### Without the utility

```typescript
export class Workflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    try {
      const foo = await step.do(
        "fetch foo",
        {
          retries: {
            limit: 10,
            delay: 1000,
            backoff: "exponential",
          },
          timeout: "5 minutes",
        },
        async () => {
          // very long function...
        },
      );

      await step.do(
        "process foo",
        {
          retries: {
            limit: 10,
            delay: 1000,
            backoff: "exponential",
          },
          timeout: "1 minute",
        },
        async () => {
          // very long function...
        },
      );
    } catch (error) {
      step.do("handle failure", async () => {
        // ...
      });
      throw error;
    }
  }
}
```

#### With the utility

```typescript
export class Workflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const { runStep } = configureStep(step, {
      defaultConfig: {
        retries: {
          limit: 10,
          delay: 1000,
          backoff: "exponential",
        },
        timeout: "5 minutes",
      },
      onError: async (error) => {
        // handle failure...
      },
    });

    const foo = await runStep("fetch foo", async () => {
      // very long function..
    });

    await runStep("process foo", { timeout: "1 minute" }, async () => {
      // very long function...
    });
  }
}
```

## License

MIT © [Lyntor Paul Figueroa](https://github.com/h4ckedneko)
