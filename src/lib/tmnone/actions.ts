import { createServerFn } from "@tanstack/react-start";
import type { TmnRequest, TmnWire } from "./types";

export const tmnAction = createServerFn({ method: "POST" })
  .validator((d: TmnRequest) => d)
  .handler(async ({ data }): Promise<TmnWire> => {
    const { runTmn } = await import("./runtime.server");
    return runTmn(data);
  });
