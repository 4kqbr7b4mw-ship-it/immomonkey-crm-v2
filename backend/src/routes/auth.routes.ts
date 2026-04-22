import { Router } from "express";

const router = Router();

router.post("/auth/login", (req, res) => {
  const { password } = req.body as { password?: string };

  if (!password) {
    return res.status(400).json({ message: "Passwort fehlt" });
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Ungültiges Passwort" });
  }

  req.session.isAuthenticated = true;

  return res.status(200).json({ success: true });
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("immomonkey_sid");
    return res.status(200).json({ success: true });
  });
});

router.get("/auth/me", (req, res) => {
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ authenticated: false });
  }

  return res.status(200).json({ authenticated: true });
});

export default router;
