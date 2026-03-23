import { describe, it, expect, vi, beforeEach } from "vitest";
import type { IncomingMessage, ServerResponse } from "node:http";
import EventEmitter from "node:events";

// ── vi.hoisted ensures these are initialized BEFORE vi.mock factories run ───
const {
  mockVerifyUser,
  mockGetResource,
  mockSetResource,
  mockExpireResource,
  mockSanitizeForCache,
  mockUserServiceInstance,
} = vi.hoisted(() => {
  const mockUserServiceInstance = {
    getUser: vi.fn(),
    editUser: vi.fn(),
    deleteUser: vi.fn(),
  };

  return {
    mockVerifyUser: vi.fn(),
    mockGetResource: vi.fn(),
    mockSetResource: vi.fn(),
    mockExpireResource: vi.fn(),
    mockSanitizeForCache: vi.fn((data: unknown) => data),
    mockUserServiceInstance,
  };
});

// ── Mocks (paths relative to THIS test file) ────────────────────────────────
vi.mock("../../../Middleware/Authentication.js", () => ({
  verifyUser: mockVerifyUser,
}));

vi.mock("../../../Config/Cache.js", () => ({
  getResource: mockGetResource,
  setResource: mockSetResource,
  expireResource: mockExpireResource,
  sanitizeForCache: mockSanitizeForCache,
}));

vi.mock("../../../Modules/users/user.repository.js", () => ({
  UserRepo: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("../../../Modules/users/user.service.js", () => ({
  UserService: vi.fn().mockImplementation(() => mockUserServiceInstance),
}));

// ── Subject under test (imported AFTER mocks) ────────────────────────────────
import { UserController } from "../../../Modules/users/user.controller.js";

// ── Fixtures ──────────────────────────────────────────────────────────────────
const mockUser = { id: "user-123", email: "test@example.com" };
const mockDatabase = {} as any;

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeRequest(method: string): IncomingMessage {
  const req = new EventEmitter() as unknown as IncomingMessage;
  req.method = method;
  req.headers = {};
  return req;
}

function makeResponse() {
  return {
    writeHead: vi.fn(),
    end: vi.fn(),
  } as unknown as ServerResponse<IncomingMessage>;
}

function emitBody(req: IncomingMessage, body: object) {
  setImmediate(() => {
    (req as unknown as EventEmitter).emit(
      "data",
      Buffer.from(JSON.stringify(body)),
    );
    (req as unknown as EventEmitter).emit("end");
  });
}

const flush = () => new Promise<void>((r) => setImmediate(r));

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("UserController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyUser.mockReturnValue(mockUser);
    mockSanitizeForCache.mockImplementation((data: unknown) => data);
  });

  describe("GET", () => {
    it("returns cached user when cache hit", async () => {
      const cachedUser = { id: "user-123", name: "Cached" };
      mockGetResource.mockResolvedValue(cachedUser);

      const req = makeRequest("GET");
      const res = makeResponse();

      await UserController(mockDatabase, req, res);

      expect(mockGetResource).toHaveBeenCalledWith("user:user-123");
      expect(mockUserServiceInstance.getUser).not.toHaveBeenCalled();
      expect(res.writeHead).toHaveBeenCalledWith(200, {
        "content-type": "application/json",
      });
      expect(res.end).toHaveBeenCalledWith(JSON.stringify(cachedUser));
    });

    it("fetches from service and populates cache on cache miss", async () => {
      const freshUser = { id: "user-123", name: "Fresh" };
      mockGetResource.mockResolvedValue(null);
      mockUserServiceInstance.getUser.mockResolvedValue(freshUser);

      const req = makeRequest("GET");
      const res = makeResponse();

      await UserController(mockDatabase, req, res);

      expect(mockUserServiceInstance.getUser).toHaveBeenCalledWith("user-123");
      expect(mockSanitizeForCache).toHaveBeenCalledWith(freshUser);
      expect(mockSetResource).toHaveBeenCalledWith(
        "user:user-123",
        freshUser,
        "other",
      );
      expect(res.writeHead).toHaveBeenCalledWith(200, {
        "content-type": "application/json",
      });
      expect(res.end).toHaveBeenCalledWith(JSON.stringify(freshUser));
    });

    it("returns 400 when getUser throws", async () => {
      mockGetResource.mockResolvedValue(null);
      mockUserServiceInstance.getUser.mockRejectedValue(new Error("DB error"));

      const req = makeRequest("GET");
      const res = makeResponse();

      await UserController(mockDatabase, req, res);

      expect(res.writeHead).toHaveBeenCalledWith(400);
      expect(res.end).toHaveBeenCalledWith(
        JSON.stringify({ error: "DB error" }),
      );
    });
  });

  describe("PATCH", () => {
    it("updates user, refreshes cache, and returns 200", async () => {
      const updatedUser = { id: "user-123", name: "Updated" };
      mockUserServiceInstance.editUser.mockResolvedValue(updatedUser);

      const req = makeRequest("PATCH");
      const res = makeResponse();

      const controllerPromise = UserController(mockDatabase, req, res);
      emitBody(req, { name: "Updated" });

      await controllerPromise;
      await flush();

      expect(mockUserServiceInstance.editUser).toHaveBeenCalledWith(
        "user-123",
        { name: "Updated" },
      );
      expect(mockSetResource).toHaveBeenCalledWith(
        "user:user-123",
        updatedUser,
        "other",
      );
      expect(res.writeHead).toHaveBeenCalledWith(200);
      expect(res.end).toHaveBeenCalledWith(JSON.stringify(updatedUser));
    });

    it("returns 400 when editUser throws", async () => {
      mockUserServiceInstance.editUser.mockRejectedValue(
        new Error("Validation failed"),
      );

      const req = makeRequest("PATCH");
      const res = makeResponse();

      const controllerPromise = UserController(mockDatabase, req, res);
      emitBody(req, { name: "" });

      await controllerPromise;
      await flush();

      expect(res.writeHead).toHaveBeenCalledWith(400);
      expect(res.end).toHaveBeenCalledWith(
        JSON.stringify({ error: "Validation failed" }),
      );
    });

    it("handles empty body gracefully", async () => {
      const updatedUser = { id: "user-123" };
      mockUserServiceInstance.editUser.mockResolvedValue(updatedUser);

      const req = makeRequest("PATCH");
      const res = makeResponse();

      const controllerPromise = UserController(mockDatabase, req, res);
      setImmediate(() => (req as unknown as EventEmitter).emit("end"));

      await controllerPromise;
      await flush();

      expect(mockUserServiceInstance.editUser).toHaveBeenCalledWith(
        "user-123",
        {},
      );
    });
  });

  describe("DELETE", () => {
    it("deletes user, expires cache, and returns 204", async () => {
      mockUserServiceInstance.deleteUser.mockResolvedValue(undefined);
      mockExpireResource.mockResolvedValue(undefined);

      const req = makeRequest("DELETE");
      const res = makeResponse();

      await UserController(mockDatabase, req, res);

      expect(mockUserServiceInstance.deleteUser).toHaveBeenCalledWith(
        "user-123",
      );
      expect(mockExpireResource).toHaveBeenCalledWith("user:user-123", 5);
      expect(res.writeHead).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });

    it("returns 400 when deleteUser throws", async () => {
      mockUserServiceInstance.deleteUser.mockRejectedValue(
        new Error("Not found"),
      );

      const req = makeRequest("DELETE");
      const res = makeResponse();

      await UserController(mockDatabase, req, res);

      expect(res.writeHead).toHaveBeenCalledWith(400);
      expect(res.end).toHaveBeenCalledWith(
        JSON.stringify({ error: "Not found" }),
      );
    });
  });

  describe("unknown method", () => {
    it("returns 404 for unsupported HTTP methods", async () => {
      const req = makeRequest("PUT");
      const res = makeResponse();

      await UserController(mockDatabase, req, res);

      expect(res.writeHead).toHaveBeenCalledWith(404);
      expect(res.end).toHaveBeenCalledWith(
        JSON.stringify({ error: "Invalid http Method" }),
      );
    });
  });
});
