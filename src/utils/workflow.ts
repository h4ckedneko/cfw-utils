import type { WorkflowStep, WorkflowStepConfig, WorkflowStepContext } from "cloudflare:workers";

export type ConfigureStepOptions = {
  // Default config applied to all steps, can be overridden per step.
  defaultConfig?: WorkflowStepConfig;
  // Cleanup callback invoked when any step fails. Receives the thrown error.
  onError?: (error: unknown) => Promise<void>;
};

/**
 * Configures a reusable step runner for a Cloudflare Workflow.
 *
 * @param step - The workflow step instance
 * @param options - See {@link ConfigureStepOptions}
 * @returns An object containing the configured `runStep` function
 *
 * @example
 * const { runStep } = configureStep(step, {
 *   defaultConfig: { timeout: "1 minute" },
 *   onError: async (error) => {
 *     await db.job.update({
 *       where: { id },
 *       data: { status: "FAILED" },
 *     });
 *   },
 * });
 *
 * const result = await runStep("fetch data", async () => {
 *   return await fetch("https://example.com").then(r => r.json());
 * });
 */
export function configureStep(step: WorkflowStep, options: ConfigureStepOptions = {}) {
  /**
   * Runs a workflow step, mirroring the `step.do` signature.
   *
   * @param name - The step name
   * @param configOrCallback - Either a config override or the callback function
   * @param maybeCallback - The callback function, if config was provided
   * @returns The resolved value of the callback
   */
  async function runStep<T extends Rpc.Serializable<T>>(
    name: string,
    callback: (ctx: WorkflowStepContext) => Promise<T>,
  ): Promise<T>;
  async function runStep<T extends Rpc.Serializable<T>>(
    name: string,
    config: WorkflowStepConfig,
    callback: (ctx: WorkflowStepContext) => Promise<T>,
  ): Promise<T>;
  async function runStep<T extends Rpc.Serializable<T>>(
    name: string,
    configOrCallback: WorkflowStepConfig | ((ctx: WorkflowStepContext) => Promise<T>),
    maybeCallback?: (ctx: WorkflowStepContext) => Promise<T>,
  ): Promise<T> {
    const config = typeof configOrCallback === "function" ? {} : configOrCallback;
    const callback = typeof configOrCallback === "function" ? configOrCallback : maybeCallback!;

    try {
      return await step.do(name, { ...options.defaultConfig, ...config }, callback);
    } catch (error) {
      if (options.onError) {
        await step.do(`handle error for: ${name}`, () => options.onError!(error));
      }
      throw error;
    }
  }

  return { runStep };
}
