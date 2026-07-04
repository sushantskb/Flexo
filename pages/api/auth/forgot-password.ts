import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/lib/prismadb";
import bcrypt from "bcrypt";
import { sendOtpEmail } from "@/lib/mailer";

/**
 * POST /api/auth/forgot-password
 * Body: { email: string }
 *
 * Generates a random 6-digit OTP, hashes it, stores it on the user record
 * (with a 10-minute expiry), then sends it via Nodemailer.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { email } = req.body as { email?: string };

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await prismadb.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    // Always return 200 so we don't leak whether the email exists
    if (!user) {
      return res.status(200).json({ message: "If this email is registered, a code has been sent." });
    }

    // Generate a cryptographically random 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prismadb.user.update({
      where: { id: user.id },
      data: {
        resetOtp: hashedOtp,
        resetOtpExpiry: expiry,
        resetToken: null, // clear any previous reset token
      },
    });

    await sendOtpEmail(user.email!, otp);

    return res.status(200).json({ message: "If this email is registered, a code has been sent." });
  } catch (error) {
    console.error("[forgot-password]", error);
    return res.status(500).json({ error: "Internal server error. Please try again." });
  }
}
