// Logger estruturado com hook pra Sentry (quando for adicionado).
//
// Uso:
//   import { logError, logInfo } from "@/lib/logger";
//   logError("checkout", err, { orderId, email });
//
// Pra plugar Sentry depois: npm i @sentry/nextjs e descomentar o bloco
// no captureError abaixo.

type LogContext = Record<string, unknown>;

function serialize(ctx: LogContext): string {
  try {
    return JSON.stringify(ctx);
  } catch {
    return "[uncloneable]";
  }
}

function captureError(scope: string, err: unknown, ctx: LogContext) {
  // Hook Sentry (quando configurado):
  // if (typeof Sentry !== "undefined") {
  //   Sentry.withScope((s) => {
  //     s.setTag("scope", scope);
  //     Object.entries(ctx).forEach(([k, v]) => s.setExtra(k, v));
  //     Sentry.captureException(err);
  //   });
  // }
  void scope;
  void err;
  void ctx;
}

export function logError(scope: string, err: unknown, ctx: LogContext = {}): void {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;

  console.error(
    JSON.stringify({
      level: "error",
      scope,
      message,
      stack,
      ctx,
      timestamp: new Date().toISOString(),
    })
  );

  captureError(scope, err, ctx);
}

export function logInfo(scope: string, message: string, ctx: LogContext = {}): void {
  console.log(
    JSON.stringify({
      level: "info",
      scope,
      message,
      ctx: Object.keys(ctx).length ? ctx : undefined,
      timestamp: new Date().toISOString(),
    })
  );
  void serialize;
}

export function logWarn(scope: string, message: string, ctx: LogContext = {}): void {
  console.warn(
    JSON.stringify({
      level: "warn",
      scope,
      message,
      ctx: Object.keys(ctx).length ? ctx : undefined,
      timestamp: new Date().toISOString(),
    })
  );
}
