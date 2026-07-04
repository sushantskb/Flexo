import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/lib/prismadb";
import bcrypt from "bcrypt";

/**
 * POST /api/auth/reset-password
 * Body: { email: string; resetToken: string; newPassword: string }
 *
 * Validates the resetToken, hashes and saves the new password, clears the token.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { email, resetToken, newPassword } = req.body as {
      email?: string;
      resetToken?: string;
      newPassword?: string;
    };

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    const user = await prismadb.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    if (!user || !user.resetToken || user.resetToken !== resetToken) {
      return res.status(400).json({ error: "Invalid or expired reset session. Please start over." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prismadb.user.update({
      where: { id: user.id },
      data: {
        hashedPassword,
        resetToken: null,
      },
    });

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("[reset-password]", error);
    return res.status(500).json({ error: "Internal server error. Please try again." });
  }
}
