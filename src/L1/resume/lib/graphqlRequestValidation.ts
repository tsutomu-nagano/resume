import { parse, visit } from "graphql";

type GraphQLRequestBody = { query?: unknown };

function hasQueryText(value: unknown): value is GraphQLRequestBody {
  return typeof value === "object" && value !== null && "query" in value;
}

function getQueryTexts(body: string): string[] | undefined {
  try {
    const parsedBody = JSON.parse(body) as unknown;
    const requests = Array.isArray(parsedBody) ? parsedBody : [parsedBody];

    if (requests.length === 0 || !requests.every(hasQueryText)) {
      return undefined;
    }

    const queries = requests.map((request) => request.query);

    return queries.every((query): query is string => typeof query === "string")
      ? queries
      : undefined;
  } catch {
    return undefined;
  }
}

function isReadOnlyOperation(query: string) {
  try {
    const document = parse(query);
    let isReadOnly = true;

    visit(document, {
      OperationDefinition(node) {
        if (node.operation !== "query") {
          isReadOnly = false;
        }
      },
      Field(node) {
        if (node.name.value === "__schema" || node.name.value === "__type") {
          isReadOnly = false;
        }
      },
    });

    return isReadOnly;
  } catch {
    return false;
  }
}

export function isReadOnlyGraphQLRequest(body: string) {
  const queries = getQueryTexts(body);

  return queries !== undefined && queries.every(isReadOnlyOperation);
}
