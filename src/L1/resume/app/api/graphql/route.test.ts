import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const request = (query = "query Probe { TABLELIST(limit: 1) { TITLE } }") =>
  new Request("https://example.test/api/graphql", {
    method: "POST",
    body: JSON.stringify({ query }),
  });

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/graphql", () => {
  it("forwards a read-only query with the restricted Hasura role", async () => {
    vi.stubEnv("HASURA_ADMIN_SECRET", "test-secret");
    vi.stubEnv("HASURA_GRAPHQL_ROLE", "resume_readonly");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { TABLELIST: [] } }), {
        headers: { "content-type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          "x-hasura-admin-secret": "test-secret",
          "x-hasura-role": "resume_readonly",
        }),
      })
    );
  });

  it("returns 502 when Hasura cannot be reached", async () => {
    vi.stubEnv("HASURA_ADMIN_SECRET", "test-secret");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const response = await POST(request());

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      errors: [{ message: "Unable to reach the GraphQL upstream service." }],
    });
  });

  it("returns 504 when the upstream request times out", async () => {
    vi.stubEnv("HASURA_ADMIN_SECRET", "test-secret");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("aborted", "AbortError"))
    );

    const response = await POST(request());

    expect(response.status).toBe(504);
    await expect(response.json()).resolves.toEqual({
      errors: [{ message: "The GraphQL upstream request timed out." }],
    });
  });
});
