-- ============================================================
-- SAFE TO RUN: Seeds the sample course only
-- Run this in Supabase SQL Editor
-- Pre-requisites: lessons table must have section_title and section_order columns
-- If those columns don't exist yet, run these two lines first:
--   ALTER TABLE lessons ADD COLUMN IF NOT EXISTS section_title text DEFAULT NULL;
--   ALTER TABLE lessons ADD COLUMN IF NOT EXISTS section_order integer DEFAULT 0;
-- ============================================================

-- Ensure section columns exist
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS section_title text DEFAULT NULL;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS section_order integer DEFAULT 0;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS lesson_type text DEFAULT 'lesson';

-- Insert the course (skip if already exists)
INSERT INTO courses (title, slug, description, content_type, status, price, is_free, skills, tags, age_group, total_lessons, total_duration_minutes, enrolled_count, rating, rating_count, meta)
VALUES (
  'Character Development for Story Writing',
  'character-development-story-writing',
  'Master the art of creating unforgettable characters! This 4-section course covers character dimensions, voice, flaws, motivation, and advanced showing techniques.',
  'course', 'published', 0, true,
  ARRAY['creative writing', 'character design', 'storytelling', 'narrative voice'],
  ARRAY['writing', 'creative', 'story'],
  ARRAY['11-13'],
  24, 240, 0, 4.8, 12, '{}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Seed all 24 lessons
DO $$
DECLARE
  v_course_id uuid;
BEGIN
  SELECT id INTO v_course_id FROM courses WHERE slug = 'character-development-story-writing';
  IF v_course_id IS NULL THEN
    RAISE NOTICE 'Course not found, skipping';
    RETURN;
  END IF;

  DELETE FROM lessons WHERE course_id = v_course_id;

  -- SECTION 1: Who Is Your Character?
  INSERT INTO lessons (course_id, title, description, content, lesson_type, section_title, section_order, order_index, duration_minutes, xp_reward, is_preview, status) VALUES
  (v_course_id, 'What Makes a Great Character?', 'Learn the Three Dimensions: Physical, Psychological, and Social.',
   '<h2>The Three Dimensions of Character</h2><p>Every great character has three dimensions:</p><ul><li><strong>Physical</strong> — How they look, move, dress</li><li><strong>Psychological</strong> — How they think, what they fear, what they want</li><li><strong>Social</strong> — How they relate to others</li></ul><p>Think of the <strong>Character Diamond</strong>: Want at the top, Need at the bottom, Flaw on one side, Strength on the other.</p>',
   'lesson', 'Section 1: Who Is Your Character?', 1, 1, 15, 20, true, 'published'),
  (v_course_id, 'Understanding Character Flaws', 'Explore common flaws and how they drive conflict.',
   '<h2>Why Flaws Matter</h2><p>A perfect character is boring. Flaws create conflict and growth.</p><ul><li><strong>Cowardice</strong></li><li><strong>Arrogance</strong></li><li><strong>Jealousy</strong></li><li><strong>Impulsiveness</strong></li><li><strong>Stubbornness</strong></li></ul>',
   'lesson', 'Section 1: Who Is Your Character?', 1, 2, 12, 20, false, 'published'),
  (v_course_id, 'Lab — The Character Diamond', 'Fill in the Character Diamond for your own character.',
   '<h2>Task 1A</h2><p>Create your character''s diamond: Want, Need, Flaw, Strength. Write 3-4 sentences for each.</p>',
   'lab', 'Section 1: Who Is Your Character?', 1, 3, 20, 30, false, 'published'),
  (v_course_id, 'Lab — Want vs Need Analysis', 'Analyze the difference between want and need.',
   '<h2>Task 1B</h2><p>What does your character want vs what they need? How are these different?</p>',
   'lab', 'Section 1: Who Is Your Character?', 1, 4, 15, 25, false, 'published'),
  (v_course_id, 'Lab — Backstory Fragment', 'Write a 5-8 sentence backstory.',
   '<h2>Task 1C</h2><p>Write a backstory explaining where they grew up, one key event, why they have their flaw, and what made their strength.</p>',
   'lab', 'Section 1: Who Is Your Character?', 1, 5, 20, 30, false, 'published'),
  (v_course_id, 'Quiz — Character Foundations', 'Test your understanding of character dimensions.', NULL,
   'quiz', 'Section 1: Who Is Your Character?', 1, 6, 10, 40, false, 'published'),

  -- SECTION 2: Voice, Flaw & Motivation
  (v_course_id, 'Character Voice — How Your Character Speaks', 'Learn voice elements: word choice, patterns, attitudes.',
   '<h2>What is Character Voice?</h2><ul><li><strong>Word choice</strong> — Simple or complex?</li><li><strong>Sentence patterns</strong> — Short or flowing?</li><li><strong>Attitudes</strong> — Optimistic? Sarcastic?</li><li><strong>Habits</strong> — Repeated phrases?</li></ul>',
   'lesson', 'Section 2: Voice, Flaw & Motivation', 2, 7, 15, 20, false, 'published'),
  (v_course_id, 'The Character Arc — Four Types', 'Understand Positive, Negative, Flat, and Transformation arcs.',
   '<h2>Four Arc Types</h2><ol><li><strong>Positive</strong> — Overcomes flaw</li><li><strong>Negative</strong> — Gives in to flaw</li><li><strong>Flat</strong> — Changes the world, not themselves</li><li><strong>Transformation</strong> — Complete reinvention</li></ol>',
   'lesson', 'Section 2: Voice, Flaw & Motivation', 2, 8, 12, 20, false, 'published'),
  (v_course_id, 'Lab — Same Scene, Two Voices', 'Write the same birthday party from two different voices.',
   '<h2>Task 2A</h2><p>Write 8-10 sentences of a birthday party. Then rewrite from a completely different character''s voice.</p>',
   'lab', 'Section 2: Voice, Flaw & Motivation', 2, 9, 25, 35, false, 'published'),
  (v_course_id, 'Lab — Plan Your Character''s Arc', 'Map your character''s transformation.',
   '<h2>Task 2B</h2><p>Choose an arc type and fill in: Start, Midpoint, Climax, Resolution.</p>',
   'lab', 'Section 2: Voice, Flaw & Motivation', 2, 10, 15, 25, false, 'published'),
  (v_course_id, 'Quiz — Voice & Arcs', 'Check your understanding of voice and arc types.', NULL,
   'quiz', 'Section 2: Voice, Flaw & Motivation', 2, 11, 10, 40, false, 'published'),

  -- SECTION 3: Show Your Character
  (v_course_id, 'The Five Methods of Revealing Character', 'Master Action, Dialogue, Thought, Description, and Reaction.',
   '<h2>Five Ways to SHOW Character</h2><ol><li><strong>Action</strong></li><li><strong>Dialogue</strong></li><li><strong>Thought</strong></li><li><strong>Description</strong></li><li><strong>Reaction</strong></li></ol>',
   'lesson', 'Section 3: Show Your Character', 3, 12, 20, 25, false, 'published'),
  (v_course_id, 'Annotated Dialogue Model', 'Study the Daniel & Priya dialogue with annotations.',
   '<h2>Reading: Annotated Extract</h2><blockquote>"You coming to the match?" Daniel asked, already halfway out the door.<br/>"I''ll think about it," Priya said, straightening books into a perfect line.</blockquote>',
   'reading', 'Section 3: Show Your Character', 3, 13, 15, 20, false, 'published'),
  (v_course_id, 'Lab — Five-Method Character Sketch', 'Write 10-15 sentences using all 5 methods.',
   '<h2>Task 3A</h2><p>Use all five methods in one passage. Label each: [ACTION], [DIALOGUE], etc.</p>',
   'lab', 'Section 3: Show Your Character', 3, 14, 25, 35, false, 'published'),
  (v_course_id, 'Lab — Annotate the Extract: Nour', 'Answer 4 comprehension questions about the Nour extract.',
   '<h2>Task 3B</h2><p>Read and analyze the Nour extract. Which methods are used? What traits are shown?</p>',
   'lab', 'Section 3: Show Your Character', 3, 15, 20, 30, false, 'published'),
  (v_course_id, 'Quiz — Showing vs Telling', 'Test your ability to show character.', NULL,
   'quiz', 'Section 3: Show Your Character', 3, 16, 10, 40, false, 'published'),

  -- SECTION 4: Build & Write
  (v_course_id, 'Three Annotated Model Extracts', 'Study Tariq, Mariam, and internal monologue examples.',
   '<h2>Model Extracts</h2><p>Three professional examples of character revelation through habit, dialogue, and thought.</p>',
   'reading', 'Section 4: Build & Write', 4, 17, 15, 20, false, 'published'),
  (v_course_id, 'Lab — Character Profile Card', 'Complete the full character profile.',
   '<h2>Step 1</h2><p>Fill in every field: name, physical, psychological, social, voice, flaw, strength, want, need, arc.</p>',
   'lab', 'Section 4: Build & Write', 4, 18, 15, 25, false, 'published'),
  (v_course_id, 'Lab — Full Scene Writing (Final Project)', 'Write your complete 300-500 word scene.',
   '<h2>Final Task</h2><p>Write a scene with: Opening, Development, Turning Point, Close. Use 3+ showing methods.</p>',
   'lab', 'Section 4: Build & Write', 4, 19, 45, 50, false, 'published'),

  -- SECTION 5: Resources
  (v_course_id, 'Character Profile Card Template', 'Downloadable template.', NULL, 'resource', 'Resources & Cheat Sheets', 5, 20, 0, 5, false, 'published'),
  (v_course_id, 'The Five Methods Quick Reference', 'Quick reference card.', NULL, 'resource', 'Resources & Cheat Sheets', 5, 21, 0, 5, false, 'published'),
  (v_course_id, 'Voice Elements Checklist', 'Checklist for character voice.', NULL, 'resource', 'Resources & Cheat Sheets', 5, 22, 0, 5, false, 'published'),
  (v_course_id, 'Arc Types at a Glance', 'Visual reference for arc types.', NULL, 'resource', 'Resources & Cheat Sheets', 5, 23, 0, 5, false, 'published'),
  (v_course_id, 'Show vs Tell Examples', '20 weak vs strong sentence examples.', NULL, 'resource', 'Resources & Cheat Sheets', 5, 24, 0, 5, false, 'published');

  UPDATE courses SET total_lessons = 24 WHERE id = v_course_id;
  RAISE NOTICE 'Sample course seeded with 24 items!';
END $$;
