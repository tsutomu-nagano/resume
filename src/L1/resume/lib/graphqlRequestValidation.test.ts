import { describe, expect, it } from "vitest";
import { isReadOnlyGraphQLRequest } from "./graphqlRequestValidation";

describe("isReadOnlyGraphQLRequest", () => {
  it("allows queries even when variables contain blocked words", () => {
    const body = JSON.stringify({
      query: "query Search($term: String!) { TABLELIST(where: { TITLE: { _like: $term } }) { TITLE } }",
      variables: { term: "mutation" },
    });

    expect(isReadOnlyGraphQLRequest(body)).toBe(true);
  });

  it.each([
    "mutation Update { update_TABLELIST { affected_rows } }",
    "subscription Updates { TABLELIST { TITLE } }",
    "query Introspection { __schema { queryType { name } } }",
  ])("rejects blocked operations", (query) => {
    expect(isReadOnlyGraphQLRequest(JSON.stringify({ query }))).toBe(false);
  });

  it("requires a valid JSON GraphQL request body", () => {
    expect(isReadOnlyGraphQLRequest("query Search { TABLELIST { TITLE } }")).toBe(false);
    expect(isReadOnlyGraphQLRequest(JSON.stringify({ variables: {} }))).toBe(false);
  });

  it("requires every batched request to be read-only", () => {
    const readOnlyBatch = JSON.stringify([
      { query: "query One { TABLELIST { TITLE } }" },
      { query: "query Two { STATLIST { STATNAME } }" },
    ]);
    const mixedBatch = JSON.stringify([
      { query: "query One { TABLELIST { TITLE } }" },
      { query: "mutation Update { update_TABLELIST { affected_rows } }" },
    ]);

    expect(isReadOnlyGraphQLRequest(readOnlyBatch)).toBe(true);
    expect(isReadOnlyGraphQLRequest(mixedBatch)).toBe(false);
  });
});
