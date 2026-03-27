# cfw-utils

A set of utility functions for Cloudflare Workers.

## Installation

```bash
npm install cfw-utils
```

## Usage

### configureStep

Configures a reusable step runner for a Cloudflare Workflow with default config and error handling support.

```typescript
import { configureStep } from "cfw-utils";

export default class MyWorkflow extends Workflow {
  async run(ctx: WorkflowStepContext) {
    const { runStep } = configureStep(ctx.env.WORKFLOW.step, {
      defaultConfig: { timeout: "1 minute" },
      onError: async (error) => {
        await db.job.update({
          where: { id },
          data: { status: "FAILED" },
        });
      },
    });

    const result = await runStep("fetch data", async () => {
      return await fetch("https://example.com").then(r => r.json());
    });
  }
}
```

## API

### configureStep(step, options)

- `step` - The workflow step instance from Cloudflare Workers
- `options` - Configuration options
  - `defaultConfig` - Default config applied to all steps, can be overridden per step
  - `onError` - Cleanup callback invoked when any step fails

Returns an object with `runStep` function that mirrors `step.do` signature but supports default config and automatic error handling.

---

MIT License - See [LICENSE](./LICENSE) for details.
