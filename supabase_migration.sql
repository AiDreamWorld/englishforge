-- ============================================================
-- EnglishForge Migration: Sections + Payment Gateways + Sample Course
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add section columns to lessons table
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS section_title text DEFAULT NULL;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS section_order integer DEFAULT 0;

-- 2. Create payment_gateways table
CREATE TABLE IF NOT EXISTS payment_gateways (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  display_name text NOT NULL,
  enabled boolean DEFAULT true,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;

-- Allow admins full access
CREATE POLICY "Admins can manage gateways" ON payment_gateways
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Allow anyone to read enabled gateways (for subscribe page)
CREATE POLICY "Anyone can read enabled gateways" ON payment_gateways
  FOR SELECT USING (enabled = true);

-- 3. Add avatar_emoji column if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_emoji text DEFAULT NULL;

-- 4. Seed the sample course: Character Development for Story Writing
-- First, insert the course (using a known teacher or null)
INSERT INTO courses (title, slug, description, content_type, status, price, is_free, skills, tags, age_group, total_lessons, total_duration_minutes, enrolled_count, rating, rating_count, meta)
VALUES (
  'Character Development for Story Writing',
  'character-development-story-writing',
  'Master the art of creating unforgettable characters! This 4-section course covers character dimensions, voice, flaws, motivation, and advanced showing techniques. Based on a proven 4-day teaching package for grades 4-6.',
  'course',
  'published',
  0,
  true,
  ARRAY['creative writing', 'character design', 'storytelling', 'narrative voice', 'literary analysis'],
  ARRAY['writing', 'creative', 'story'],
  ARRAY['11-13', 'grades 4-6'],
  19,
  240,
  0,
  4.8,
  12,
  '{}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Get the course ID for lesson inserts
DO $$
DECLARE
  v_course_id uuid;
BEGIN
  SELECT id INTO v_course_id FROM courses WHERE slug = 'character-development-story-writing';

  IF v_course_id IS NULL THEN
    RAISE NOTICE 'Course not found, skipping lesson inserts';
    RETURN;
  END IF;

  -- Delete existing lessons for this course (in case of re-run)
  DELETE FROM lessons WHERE course_id = v_course_id;

  -- ===== SECTION 1: Who Is Your Character? (Day 1) =====
  INSERT INTO lessons (course_id, title, description, content, lesson_type, section_title, section_order, order_index, duration_minutes, xp_reward, is_preview, status) VALUES
  (v_course_id, 'Section 1: What Makes a Great Character?', 'Learn the Three Dimensions of character: Physical, Psychological, and Social. Discover the Character Diamond concept.',
   '<h2>The Three Dimensions of Character</h2><p>Every great character has three dimensions:</p><ul><li><strong>Physical</strong> — How they look, move, and dress</li><li><strong>Psychological</strong> — How they think, what they fear, what they want</li><li><strong>Social</strong> — How they relate to others, their status, their role</li></ul><p>Think of the <strong>Character Diamond</strong>: Want at the top, Need at the bottom, Flaw on one side, Strength on the other.</p>',
   'lesson', 'Section 1: Who Is Your Character?', 1, 1, 15, 20, true, 'published'),

  (v_course_id, 'Section 1: Understanding Character Flaws', 'Explore common character flaws like cowardice, arrogance, and jealousy — and how they drive story conflict.',
   '<h2>Why Flaws Matter</h2><p>A perfect character is a boring character. Flaws create conflict, growth, and relatability.</p><h3>Common Character Flaws</h3><ul><li><strong>Cowardice</strong> — Avoiding danger or confrontation</li><li><strong>Arrogance</strong> — Believing they are better than others</li><li><strong>Jealousy</strong> — Wanting what others have</li><li><strong>Impulsiveness</strong> — Acting without thinking</li><li><strong>Stubbornness</strong> — Refusing to change or listen</li></ul>',
   'lesson', 'Section 1: Who Is Your Character?', 1, 2, 12, 20, false, 'published'),

  (v_course_id, 'Section 1: Lab — The Character Diamond', 'Fill in the Character Diamond for your own character: Want, Need, Flaw, and Strength.',
   '<h2>Task 1A: The Character Diamond</h2><p>Create your own character and fill in their diamond:</p><ol><li><strong>Want</strong> — What does your character think they need?</li><li><strong>Need</strong> — What do they actually need to grow?</li><li><strong>Flaw</strong> — What holds them back?</li><li><strong>Strength</strong> — What makes them special?</li></ol><p>Write 3-4 sentences for each point.</p>',
   'lab', 'Section 1: Who Is Your Character?', 1, 3, 20, 30, false, 'published'),

  (v_course_id, 'Section 1: Lab — Want vs Need Analysis', 'Analyze the difference between what your character wants and what they truly need.',
   '<h2>Task 1B: Want vs Need</h2><p>Using your character from the previous lab, write a detailed analysis:</p><ul><li>What does your character <em>want</em> at the start of the story?</li><li>What do they actually <em>need</em>?</li><li>How are these different?</li><li>What will happen when they realize the difference?</li></ul>',
   'lab', 'Section 1: Who Is Your Character?', 1, 4, 15, 25, false, 'published'),

  (v_course_id, 'Section 1: Lab — Backstory Fragment', 'Write a 5-8 sentence backstory paragraph for your character.',
   '<h2>Task 1C: Backstory Fragment</h2><p>Write a short backstory (5-8 sentences) that explains:</p><ul><li>Where your character grew up</li><li>One key event that shaped who they are</li><li>Why they have their main flaw</li><li>What made them develop their strength</li></ul><p><em>This paragraph won''t appear in your final story — it''s background knowledge that helps you write them authentically.</em></p>',
   'lab', 'Section 1: Who Is Your Character?', 1, 5, 20, 30, false, 'published'),

  (v_course_id, 'Section 1: Quiz — Character Foundations', 'Test your understanding of character dimensions, flaws, and the Character Diamond.',
   NULL, 'quiz', 'Section 1: Who Is Your Character?', 1, 6, 10, 40, false, 'published'),

  -- ===== SECTION 2: Voice, Flaw & Motivation (Day 2) =====
  (v_course_id, 'Section 2: Character Voice — How Your Character Speaks', 'Learn the elements of voice: word choice, sentence patterns, attitudes, and habits. Compare two versions of the same character.',
   '<h2>What is Character Voice?</h2><p>Voice is how your character sounds on the page. It includes:</p><ul><li><strong>Word choice</strong> — Simple or complex? Formal or slang?</li><li><strong>Sentence patterns</strong> — Short and punchy? Long and flowing?</li><li><strong>Attitudes</strong> — Optimistic? Sarcastic? Anxious?</li><li><strong>Habits</strong> — Do they repeat phrases? Avoid certain words?</li></ul><h3>Example: Amir Version A vs Version B</h3><p><em>Version A:</em> "Whatever. It doesn''t matter anyway."</p><p><em>Version B:</em> "I suppose... it might not be entirely relevant. But one does wonder."</p><p>Same character, two completely different voices. Voice reveals personality.</p>',
   'lesson', 'Section 2: Voice, Flaw & Motivation', 2, 7, 15, 20, false, 'published'),

  (v_course_id, 'Section 2: The Character Arc — Four Types', 'Understand the four types of character arcs and how to plan your character''s transformation.',
   '<h2>The Four Arc Types</h2><ol><li><strong>Positive Arc</strong> — Character overcomes flaw, gets what they need (most common)</li><li><strong>Negative Arc</strong> — Character gives in to flaw, things get worse</li><li><strong>Flat Arc</strong> — Character stays the same but changes the world around them</li><li><strong>Transformation Arc</strong> — Character completely reinvents themselves</li></ol><h3>The Arc Diagram</h3><p><strong>Start</strong> → <strong>Midpoint</strong> (challenge) → <strong>Climax</strong> (decision) → <strong>Resolution</strong> (new self)</p>',
   'lesson', 'Section 2: Voice, Flaw & Motivation', 2, 8, 12, 20, false, 'published'),

  (v_course_id, 'Section 2: Lab — Same Scene, Two Voices', 'Write the same birthday party scene from two different character voices.',
   '<h2>Task 2A: Two Voices, One Scene</h2><p>Write a short scene (8-10 sentences) of a birthday party. Then rewrite the <em>exact same scene</em> from a completely different character''s voice.</p><p>Character A might be excited and talkative. Character B might be shy and observant. Same cake, same balloons — totally different experience.</p>',
   'lab', 'Section 2: Voice, Flaw & Motivation', 2, 9, 25, 35, false, 'published'),

  (v_course_id, 'Section 2: Lab — Plan Your Character''s Arc', 'Map out your character''s transformation using the four-stage arc table.',
   '<h2>Task 2B: Arc Planning Table</h2><p>Choose one of the four arc types and fill in:</p><table><tr><th>Stage</th><th>Your Character</th></tr><tr><td>Start (who they are)</td><td></td></tr><tr><td>Midpoint (what challenges them)</td><td></td></tr><tr><td>Climax (what decision they face)</td><td></td></tr><tr><td>Resolution (who they become)</td><td></td></tr></table>',
   'lab', 'Section 2: Voice, Flaw & Motivation', 2, 10, 15, 25, false, 'published'),

  (v_course_id, 'Section 2: Quiz — Voice & Arcs', 'Check your understanding of character voice elements and arc types.',
   NULL, 'quiz', 'Section 2: Voice, Flaw & Motivation', 2, 11, 10, 40, false, 'published'),

  -- ===== SECTION 3: Show Your Character (Day 3) =====
  (v_course_id, 'Section 3: The Five Methods of Revealing Character', 'Master the 5 techniques: Action, Dialogue, Thought, Description, and Reaction. With weak vs strong examples.',
   '<h2>Five Ways to SHOW Character</h2><p>Don''t tell the reader your character is brave — show it!</p><ol><li><strong>Action</strong> — What they DO reveals who they are<br/><em>Weak:</em> "She was brave." <em>Strong:</em> "She stepped between the dog and the smaller child."</li><li><strong>Dialogue</strong> — What they SAY (and how)<br/><em>Weak:</em> "He was rude." <em>Strong:</em> "''Move,'' he snapped, not looking up from his phone."</li><li><strong>Thought</strong> — Internal monologue<br/><em>Weak:</em> "She was worried." <em>Strong:</em> "What if they laughed? What if they all just... stared?"</li><li><strong>Description</strong> — Physical details that hint at personality<br/><em>Weak:</em> "He looked messy." <em>Strong:</em> "His shoelaces dragged behind him like tiny surrendered flags."</li><li><strong>Reaction</strong> — How others respond to them<br/><em>Weak:</em> "Everyone liked her." <em>Strong:</em> "When she entered, three people waved and two moved their bags to make space."</li></ol>',
   'lesson', 'Section 3: Show Your Character', 3, 12, 20, 25, false, 'published'),

  (v_course_id, 'Section 3: Annotated Dialogue Model', 'Study the Daniel & Priya dialogue extract with professional annotations.',
   '<h2>Reading Activity: Annotated Extract</h2><p>Read the dialogue between Daniel and Priya. Notice how every line reveals character:</p><blockquote>"You coming to the match?" Daniel asked, already halfway out the door.<br/>"I''ll think about it," Priya said, straightening the books on her desk into a perfect line.</blockquote><p><strong>Analysis:</strong> Daniel = impulsive, physical, assumes yes. Priya = careful, orderly, non-committal. Two lines of dialogue = two fully revealed characters.</p>',
   'reading', 'Section 3: Show Your Character', 3, 13, 15, 20, false, 'published'),

  (v_course_id, 'Section 3: Lab — Five-Method Character Sketch', 'Write 10-15 sentences revealing your character using all 5 methods.',
   '<h2>Task 3A: Five-Method Sketch</h2><p>Write a 10-15 sentence passage about your character that uses <strong>all five methods</strong>:</p><ol><li>At least 2 sentences showing through <strong>action</strong></li><li>At least 2 lines of <strong>dialogue</strong></li><li>At least 2 sentences of <strong>internal thought</strong></li><li>At least 1 <strong>physical description</strong> detail</li><li>At least 1 <strong>reaction</strong> from another character</li></ol><p>Label each method in brackets after the sentence, e.g. [ACTION]</p>',
   'lab', 'Section 3: Show Your Character', 3, 14, 25, 35, false, 'published'),

  (v_course_id, 'Section 3: Lab — Annotate the Extract: Nour', 'Answer 4 comprehension questions about the Nour character extract.',
   '<h2>Task 3B: Annotation Exercise</h2><p>Read this extract about Nour and answer the questions:</p><blockquote>Nour pushed her chair back, the scraping sound cutting through the library silence. Three heads turned. She didn''t notice. She was already pulling at the spine of a book on the top shelf, standing on tiptoes, tongue pressed against her upper lip in concentration.</blockquote><ol><li>Which method(s) does the writer use to reveal Nour?</li><li>What personality traits can you identify?</li><li>How does the reaction of the other people add to characterization?</li><li>Rewrite this extract changing Nour into a timid, careful character.</li></ol>',
   'lab', 'Section 3: Show Your Character', 3, 15, 20, 30, false, 'published'),

  (v_course_id, 'Section 3: Quiz — Showing vs Telling', 'Test your ability to identify and use the five methods of character revelation.',
   NULL, 'quiz', 'Section 3: Show Your Character', 3, 16, 10, 40, false, 'published'),

  -- ===== SECTION 4: Build & Write (Day 4) =====
  (v_course_id, 'Section 4: Three Annotated Model Extracts', 'Study professional examples: Tariq (habit), Mariam (dialogue), and internal monologue techniques.',
   '<h2>Model Extract 1: Tariq — Revealing Through Habit</h2><blockquote>Tariq always counted things. Steps to the bus stop (forty-seven). Ceiling tiles in Mrs Hammond''s classroom (thirty-two). It wasn''t that he liked numbers. It was that counting kept the world in order, and without order, the thoughts crept in.</blockquote><h2>Model Extract 2: Mariam — Revealing Through Dialogue</h2><blockquote>"I don''t need help," Mariam said, for the third time. She stacked the boxes higher, chin tilted up. One wobbled.<br/>"Just one hand," offered Yusuf.<br/>"I said no." But her voice cracked on the last word.</blockquote><h2>Model Extract 3: Internal Monologue</h2><blockquote>Don''t look at them. Don''t look. If you look, they''ll know. And if they know, they''ll ask, and if they ask, you''ll have to explain, and you cannot explain this. Not yet. Not ever.</blockquote>',
   'reading', 'Section 4: Build & Write', 4, 17, 15, 20, false, 'published'),

  (v_course_id, 'Section 4: Lab — Character Profile Card', 'Complete the full character profile card with all dimensions, voice notes, arc plan, and key scenes.',
   '<h2>Step 1: Complete Profile Card</h2><p>Fill in every field for your character:</p><ul><li><strong>Name & Age:</strong></li><li><strong>Physical description</strong> (3 key details):</li><li><strong>Psychological traits</strong> (fears, desires, habits):</li><li><strong>Social context</strong> (friends, family, status):</li><li><strong>Voice notes</strong> (how they speak, favorite phrases):</li><li><strong>Flaw:</strong></li><li><strong>Strength:</strong></li><li><strong>Want vs Need:</strong></li><li><strong>Arc type:</strong></li></ul><p>This is your reference sheet for the final writing task.</p>',
   'lab', 'Section 4: Build & Write', 4, 18, 15, 25, false, 'published'),

  (v_course_id, 'Section 4: Lab — Full Scene Writing (Final Project)', 'Write your complete scene with Opening, Development, Turning Point, and Close. This is the major course submission.',
   '<h2>The Final Task: Write Your Scene</h2><p>Using everything you''ve learned, write a complete scene (300-500 words) with four parts:</p><ol><li><strong>Opening</strong> — Introduce your character in action. Show at least 2 character traits through the five methods.</li><li><strong>Development</strong> — Build tension. Show the character''s flaw in action.</li><li><strong>Turning Point</strong> — Something happens that forces the character to face their flaw.</li><li><strong>Close</strong> — Show the beginning of change (or the refusal to change).</li></ol><h3>Checklist Before Submitting:</h3><ul><li>☐ Used at least 3 of the 5 showing methods</li><li>☐ Character''s voice is consistent</li><li>☐ Flaw is visible through action (not told)</li><li>☐ At least one moment of internal thought</li><li>☐ Dialogue reveals character, not just information</li></ul>',
   'lab', 'Section 4: Build & Write', 4, 19, 45, 50, false, 'published');

  -- ===== SECTION: Resources (Cheat Sheets) =====
  INSERT INTO lessons (course_id, title, description, lesson_type, section_title, section_order, order_index, duration_minutes, xp_reward, is_preview, status) VALUES
  (v_course_id, 'Cheat Sheet 1: Character Profile Card Template', 'Downloadable template for creating character profiles.', 'resource', 'Resources & Cheat Sheets', 5, 20, 0, 5, false, 'published'),
  (v_course_id, 'Cheat Sheet 2: The Five Methods Quick Reference', 'Quick reference card for the five methods of revealing character.', 'resource', 'Resources & Cheat Sheets', 5, 21, 0, 5, false, 'published'),
  (v_course_id, 'Cheat Sheet 3: Voice Elements Checklist', 'Checklist for developing consistent character voice.', 'resource', 'Resources & Cheat Sheets', 5, 22, 0, 5, false, 'published'),
  (v_course_id, 'Cheat Sheet 4: Arc Types at a Glance', 'Visual reference for the four character arc types.', 'resource', 'Resources & Cheat Sheets', 5, 23, 0, 5, false, 'published'),
  (v_course_id, 'Cheat Sheet 5: Show vs Tell Examples', '20 examples of weak (telling) vs strong (showing) sentences.', 'resource', 'Resources & Cheat Sheets', 5, 24, 0, 5, false, 'published');

  -- Update the course total_lessons count
  UPDATE courses SET total_lessons = 24 WHERE id = v_course_id;

  RAISE NOTICE 'Sample course seeded successfully with 24 items!';
END $$;

-- ============================================================
-- DONE! You should now see:
-- - lessons table has section_title and section_order columns
-- - payment_gateways table exists
-- - "Character Development for Story Writing" course with 24 items
-- ============================================================
