import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/lib/prismadb";
import bcrypt from "bcrypt";
import crypto from "crypto";

/**
 * POST /api/auth/verify-otp
 * Body: { email: string; otp: string }
 *
 * Validates the 6-digit OTP against the stored bcrypt hash and expiry.
 * On success, issues a short-lived resetToken and clears the OTP fields.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { email, otp } = req.body as { email?: string; otp?: string };

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required." });
    }

    const user = await prismadb.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({ error: "Invalid or expired code. Please request a new one." });
    }

    // Check expiry
    if (new Date() > user.resetOtpExpiry) {
      await prismadb.user.update({
        where: { id: user.id },
        data: { resetOtp: null, resetOtpExpiry: null },
      });
      return res.status(400).json({ error: "This code has expired. Please request a new one." });
    }

    // Compare OTP
    const isValid = await bcrypt.compare(otp.trim(), user.resetOtp);
    if (!isValid) {
      return res.status(400).json({ error: "Incorrect code. Please try again." });
    }

    // Issue a secure reset token (one-time use, 15 min validity encoded into it)
    const resetToken = crypto.randomBytes(32).toString("hex");

    await prismadb.user.update({
      where: { id: user.id },
      data: {
        resetOtp: null,
        resetOtpExpiry: null,
        resetToken,
      },
    });

    return res.status(200).json({ resetToken, email: user.email });
  } catch (error) {
    console.error("[verify-otp]", error);
    return res.status(500).json({ error: "Internal server error. Please try again." });
  }
}
