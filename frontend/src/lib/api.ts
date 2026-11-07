import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: unknown };
    if (typeof data.error === "string") return data.error;
  } catch {
    return "Something went wrong on the academy API.";
  }
  return "Something went wrong on the academy API.";
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const store = await cookies();
  const cookie = store.toString();

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...(cookie ? { cookie } : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(response.status, await parseError(response));
  }

  return (await response.json()) as T;
}

export async function getApiHealth(): Promise<string | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      cache: "no-store",
    });
    if (response.ok) return null;
    return await parseError(response);
  } catch {
    return "The academy API is not reachable. Start the backend and try again.";
  }
}
