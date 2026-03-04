import { Router } from "express";
import { createSupabaseAdminClient } from "../supabase.js";

const router = Router();

const ALLOWED_REASONS = [
  "no-longer-needed",
  "too-complicated",
  "found-alternative",
  "privacy-concerns",
  "missing-features",
  "other",
];

// DELETE /account
router.delete("/", async (req, res) => {
  const { reason, details } = req.body ?? {};

  if (!reason || !ALLOWED_REASONS.includes(reason)) {
    res.status(400).json({ error: "Invalid or missing reason" });
    return;
  }

  const userId = req.userId;
  const admin = createSupabaseAdminClient();

  try {
    // 1. Save feedback
    const { error: feedbackErr } = await admin
      .from("account_deletion_feedback")
      .insert({ user_id: userId, reason, details: details || null });

    if (feedbackErr) {
      console.error("Failed to save deletion feedback:", feedbackErr.message);
      // Continue with deletion even if feedback save fails
    }

    // 2. Delete storage files
    const { data: files } = await admin.storage
      .from("uploads")
      .list(userId);

    if (files && files.length > 0) {
      const paths = files.map((f) => `${userId}/${f.name}`);
      await admin.storage.from("uploads").remove(paths);
    }

    // 3. Delete user data from tables in FK-safe order
    const tables = [
      "documents",
      "substeps",
      "sessions",
      "tasks",
      "goals",
      "courses",
      "periods",
      "semesters",
      "study_time_goals",
    ];

    for (const table of tables) {
      const { error } = await admin.from(table).delete().eq("user_id", userId);
      if (error) {
        console.error(`Failed to delete from ${table}:`, error.message);
      }
    }

    // 4. Delete auth user
    const { error: authErr } = await admin.auth.admin.deleteUser(userId);
    if (authErr) {
      console.error("Failed to delete auth user:", authErr.message);
      res.status(500).json({ error: "Failed to delete account" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    console.error("Account deletion error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
