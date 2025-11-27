import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const sendToken = (user, statusCode, res) => {
  const accessToken = jwt.sign(
    { id: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "48h", // Set the expiration time to 3 hours
    }
  );

  // res.cookie("access_token", accessToken, {
  //   expires: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
  //   maxAge: 3 * 60 * 60 * 1000, // 3 hours in milliseconds
  //   httpOnly: true,
  //   sameSite: "lax",
  // });

  res.status(statusCode).json({
    success: true,
    data: {
      ...user._doc,
      accessToken,
    },
  });
};
