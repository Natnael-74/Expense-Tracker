import jwt from 'jsonwebtoken';

function signToken(id, res, message, user = null) {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res.cookie('jwt', token, cookieOptions);

  // remove sensitive fields
  if (user) {
    user.password = undefined;
    user.passwordChangedAt = undefined;
  }

  res.status(201).json({
    status: 'success',
    message,
    token,
    data: {
      user,
    },
  });
}

export default signToken;
