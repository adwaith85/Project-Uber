import jwt from 'jsonwebtoken';

export const LoginCheck = async (req, res, next) => {
  console.log("middle", process.env.JWT_SECRET);

  try {
    const authHeader = req.headers['authorization'];

    // 1️⃣ Check if header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: 'Authorization token missing or malformed' });
    }

    // 2️⃣ Correct split — use a space, not empty string
    const token = authHeader.split(' ')[1]; 

    // 3️⃣ Verify the token with the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Attach decoded user info to req.user
    req.user = decoded;

    next();
  } catch (err) {
    console.error(err);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};
