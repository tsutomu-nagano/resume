const DEFAULT_HASURA_GRAPHQL_ENDPOINT = "https://assuring-phoenix-83.hasura.app/v1/graphql";

export const dynamic = "force-dynamic";

function getHasuraConfig() {
  return {
    endpoint: process.env.HASURA_GRAPHQL_ENDPOINT || DEFAULT_HASURA_GRAPHQL_ENDPOINT,
    adminSecret: process.env.HASURA_ADMIN_SECRET,
    role: process.env.HASURA_GRAPHQL_ROLE,
  };
}

type GraphQLRequestBody = { query?: unknown };

function hasQueryText(value: unknown): value is GraphQLRequestBody {
  return typeof value === "object" && value !== null && "query" in value;
}

function getGraphQLOperationText(body: string) {
  try {
    const parsedBody = JSON.parse(body) as unknown;

    if (Array.isArray(parsedBody)) {
      return parsedBody
        .filter(hasQueryText)
        .map((requestBody) => requestBody.query)
        .filter((query): query is string => typeof query === "string")
        .join("\n");
    }

    if (hasQueryText(parsedBody) && typeof parsedBody.query === "string") {
      return parsedBody.query;
    }
  } catch {
    return body;
  }

  return body;
}

function isReadOnlyGraphQLRequest(body: string) {
  const normalizedOperationText = getGraphQLOperationText(body).toLowerCase();

  return ![
    "mutation",
    "subscription",
    "__schema",
    "__type",
  ].some((blockedToken) => normalizedOperationText.includes(blockedToken));
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

  const hasuraResponse = await fetch(endpoint, {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  });

  return new Response(await hasuraResponse.text(), {
    status: hasuraResponse.status,
    headers: {
      "content-type": hasuraResponse.headers.get("content-type") || "application/json",
    },
  });
}
