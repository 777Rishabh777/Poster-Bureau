const { requireAuth } = require('../../middleware/requireAuth');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

describe('requireAuth middleware', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.JWT_SECRET;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const makeRes = () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    return res;
  };

  const makeReq = (authHeader) => ({
    headers: { authorization: authHeader },
  });

  test('returns 401 when Authorization header is missing', () => {
    const req = makeReq(undefined);
    const res = makeRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing Bearer token' });
    expect(next).not.toHaveBeenCalled();
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  test('returns 401 when Authorization is not Bearer or token missing', () => {
    const cases = [
      'Basic abc123',
      'Bearer',
      'Bearer ', // trailing space no token
      'bearer token', // wrong case
    ];

    for (const header of cases) {
      const req = makeReq(header);
      const res = makeRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing Bearer token' });
      expect(next).not.toHaveBeenCalled();
    }

    expect(jwt.verify).not.toHaveBeenCalled();
  });

  test('returns 401 when jwt.verify throws (invalid token)', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('bad token');
    });

    const req = makeReq('Bearer abc.def.ghi');
    const res = makeRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('abc.def.ghi', 'dev_secret_change_me');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next and attaches payload when token is valid', () => {
    const payload = { sub: 'user1', role: 'admin' };
    jwt.verify.mockReturnValue(payload);

    const req = makeReq('Bearer good.token.value');
    const res = makeRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('good.token.value', 'dev_secret_change_me');
    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('uses JWT_SECRET env var when provided', () => {
    process.env.JWT_SECRET = 'my_secret';
    const payload = { id: 123 };
    jwt.verify.mockReturnValue(payload);

    const req = makeReq('Bearer tkn');
    const res = makeRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('tkn', 'my_secret');
    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
