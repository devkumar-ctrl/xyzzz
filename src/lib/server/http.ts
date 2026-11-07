export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function toErrorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof SyntaxError) {
    return Response.json(
      { error: "The request body is not valid JSON." },
      { status: 400 },
    );
  }
  console.error("API error", error);
  return Response.json(
    { error: "Something went wrong on the academy API." },
    { status: 500 },
  );
}
