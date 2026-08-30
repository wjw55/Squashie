export function errorContext(error: unknown) {
  const chain: Array<Record<string, unknown>> = [];
  let current = error;

  while (current instanceof Error && chain.length < 5) {
    const diagnostic = current as Error & {
      cause?: unknown;
      code?: string;
      severity?: string;
      detail?: string;
    };
    chain.push({
      name: diagnostic.name,
      message: diagnostic.message,
      code: diagnostic.code,
      severity: diagnostic.severity,
      detail: diagnostic.detail,
    });
    current = diagnostic.cause;
  }

  return chain;
}
