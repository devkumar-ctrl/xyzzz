export class ClientApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ClientApiError";
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : "Something went wrong on the academy API.";
    throw new ClientApiError(response.status, message);
  }

  return data as T;
}

export async function apiPost<T>(
  path: string,
  body: unknown = {},
): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseResponse<T>(response);
}

export async function apiPut<T>(
  path: string,
  body: unknown = {},
): Promise<T> {
  const response = await fetch(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseResponse<T>(response);
}
