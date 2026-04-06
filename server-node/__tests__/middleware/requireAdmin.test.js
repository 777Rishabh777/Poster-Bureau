const { requireAdmin } = require('../../middleware/requireAuth');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

describe('requireAdmin middleware', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.JWT_SECRET;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const makeRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  });

  const makeReq = (authHeader) => ({
    headers: { authorization: authHeader },
  });

  test('returns 401 when Authorization header is missing', () => {
    const req = makeReq(undefined);
    const res = makeRes();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing Bearer token' });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 403 when token is valid but user is not admin', () => {
    jwt.verify.mockReturnValue({ sub: 'user1', role: 'user' });

    const req = makeReq('Bearer valid.user.token');
    const res = makeRes();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Admin access required' });
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next when admin token is valid', () => {
    const payload = { sub: 'admin', role: 'admin' };
    jwt.verify.mockReturnValue(payload);

    const req = makeReq('Bearer admin.good.token');
    const res = makeRes();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('admin.good.token', 'dev_secret_change_me');
    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
