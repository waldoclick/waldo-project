/**
 * Route definition assertions for ad-pack — SEC2-AUTHZ
 *
 * Verifies that create/update/delete routes carry the global::isManager policy.
 * These are structural tests on the route config object — no HTTP server needed.
 *
 * RED phase: these tests fail when routes have config.policies: [] (current state).
 */

import routeConfig from "../../../src/api/ad-pack/routes/ad-pack";

interface RouteEntry {
  method: string;
  path: string;
  handler: string;
  config?: { policies?: string[] };
}

const routes: RouteEntry[] = routeConfig.routes as RouteEntry[];

function findRoute(method: string, path: string): RouteEntry | undefined {
  return routes.find(
    (r) => r.method.toUpperCase() === method.toUpperCase() && r.path === path,
  );
}

describe("ad-pack route authorization — isManager on write routes", () => {
  it("POST /ad-packs (create) has global::isManager policy", () => {
    const route = findRoute("POST", "/ad-packs");
    expect(route).toBeDefined();
    expect(route?.config?.policies).toContain("global::isManager");
  });

  it("PUT /ad-packs/:id (update) has global::isManager policy", () => {
    const route = findRoute("PUT", "/ad-packs/:id");
    expect(route).toBeDefined();
    expect(route?.config?.policies).toContain("global::isManager");
  });

  it("DELETE /ad-packs/:id (delete) has global::isManager policy", () => {
    const route = findRoute("DELETE", "/ad-packs/:id");
    expect(route).toBeDefined();
    expect(route?.config?.policies).toContain("global::isManager");
  });

  it("GET /ad-packs (find) does NOT require isManager (public read)", () => {
    const route = findRoute("GET", "/ad-packs");
    expect(route).toBeDefined();
    // Read routes should remain accessible (no isManager restriction)
    const policies = route?.config?.policies ?? [];
    expect(policies).not.toContain("global::isManager");
  });

  it("GET /ad-packs/:id (findOne) does NOT require isManager (public read)", () => {
    const route = findRoute("GET", "/ad-packs/:id");
    expect(route).toBeDefined();
    const policies = route?.config?.policies ?? [];
    expect(policies).not.toContain("global::isManager");
  });
});
