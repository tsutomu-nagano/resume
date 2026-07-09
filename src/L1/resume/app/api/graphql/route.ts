import { isReadOnlyGraphQLRequest } from "@/lib/graphqlRequestValidation";

const DEFAULT_HASURA_GRAPHQL_ENDPOINT = "https://assuring-phoenix-83.hasura.app/v1/graphql";
const HASURA_REQUEST_TIMEOUT_MS = 10_000;

export const dynamic = "force-dynamic";

function getHasuraConfig() {
  return {
    endpoint: process.env.HASURA_GRAPHQL_ENDPOINT || DEFAULT_HASURA_GRAPHQL_ENDPOINT,
    adminSecret: process.env.HASURA_ADMIN_SECRET,
    role: process.env.HASURA_GRAPHQL_ROLE,
  };
}

export async function POST(request: Request) {
  const { endpoint, adminSecret, role } = getHasuraConfig();

  if (!adminSecret) {
    return Response.json(
      { errors: [{ message: "HASURA_ADMIN_SECRET is not configured." }] },
      { status: 500 }
    );
  }

  const body = await request.text();

  if (!isReadOnlyGraphQLRequest(body)) {
    return Response.json(
      { errors: [{ message: "Only read-only GraphQL queries are allowed." }] },
      { status: 400 }
    );
  }

  const headers: Record<string, string> = {
    "content-type": request.headers.get("content-type") || "application/json",
    "x-hasura-admin-secret": adminSecret,
  };

  if (role) {
    headers["x-hasura-role"] = role;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HASURA_REQUEST_TIMEOUT_MS);

  try {
    const hasuraResponse = await fetch(endpoint, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
      signal: controller.signal,
    });

    return new Response(await hasuraResponse.text(), {
      status: hasuraResponse.status,
      headers: {
        "content-type": hasuraResponse.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "AbortError";

    return Response.json(
      {
        errors: [
          {
            message: timedOut
              ? "The GraphQL upstream request timed out."
              : "Unable to reach the GraphQL upstream service.",
          },
        ],
      },
      { status: timedOut ? 504 : 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
