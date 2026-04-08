import { Router } from "express";
import { db } from "@workspace/db";
import { studentProfiles } from "@workspace/db";

const router = Router();

// GET /profile — get most recent profile
router.get("/", async (req, res) => {
  try {
    const [profile] = await db
      .select()
      .from(studentProfiles)
      .limit(1);
    
    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    
    res.json({
      ...profile,
      subjects: profile.subjects ?? [],
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get profile");
    res.status(500).json({ error: "Failed to get profile" });
  }
});

// POST /profile — create profile
router.post("/", async (req, res) => {
  try {
    const { name, subjects, difficulty, learningStyle } = req.body as {
      name: string;
      subjects: string[];
      difficulty: string;
      learningStyle: string;
    };

    if (!name || !subjects || !difficulty || !learningStyle) {
      res.status(400).json({ error: "name, subjects, difficulty, and learningStyle are required" });
      return;
    }

    // Delete any existing profiles (single user app)
    await db.delete(studentProfiles);

    const [profile] = await db
      .insert(studentProfiles)
      .values({ name, subjects, difficulty, learningStyle })
      .returning();

    res.status(201).json({
      ...profile,
      subjects: profile.subjects ?? [],
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create profile");
    res.status(500).json({ error: "Failed to create profile" });
  }
});

// PUT /profile — update profile
router.put("/", async (req, res) => {
  try {
    const { name, subjects, difficulty, learningStyle } = req.body as {
      name: string;
      subjects: string[];
      difficulty: string;
      learningStyle: string;
    };

    // Delete and recreate
    await db.delete(studentProfiles);
    const [profile] = await db
      .insert(studentProfiles)
      .values({ name, subjects, difficulty, learningStyle })
      .returning();

    res.json({
      ...profile,
      subjects: profile.subjects ?? [],
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update profile");
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
