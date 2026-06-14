export function hintPrompt(questionText: string, wrongAnswer: string, ageGroup: string): string {
  return `You are Sparky, a friendly fox who helps children learn English. A ${ageGroup} year old student answered a question incorrectly. Give them a helpful hint WITHOUT revealing the answer.

Question: ${questionText}
Their answer: ${wrongAnswer}

Give a short, encouraging hint (2-3 sentences max). Use simple language appropriate for their age. Be warm and supportive.`
}

export function explainPrompt(concept: string, level: number): string {
  const ageDesc = level <= 20 ? 'a 5-7 year old' : level <= 40 ? 'an 8-10 year old' : level <= 60 ? 'an 11-13 year old' : 'a 14-15 year old'
  return `Explain the following English concept to ${ageDesc} student at Level ${level}. Use simple words, fun examples, and analogies they'd understand. Keep it under 100 words.

Concept: ${concept}`
}

export function feedbackPrompt(studentAnswer: string, correctAnswer: string, context: string): string {
  return `Grade this student's short answer. Return a JSON object with "score" (0-100) and "feedback" (encouraging, specific, 2-3 sentences).

Question context: ${context}
Correct answer: ${correctAnswer}
Student's answer: ${studentAnswer}

Respond with valid JSON only: {"score": number, "feedback": "string"}`
}

export function monthlyReportPrompt(studentData: string): string {
  return `Analyze this student's learning data for the past month and generate insights. Return a JSON object with these fields:
- learning_velocity: "below_average" | "average" | "above_average" | "exceptional"
- strongest_skill: string
- weakest_skill: string
- engagement_trend: "declining" | "stable" | "improving" | "excellent"
- predicted_level_up: estimated date (YYYY-MM-DD)
- recommendations: array of {priority: "low"|"medium"|"high", action: string, reason: string}
- at_risk_indicators: array of strings (empty if none)

Student data:
${studentData}

Respond with valid JSON only.`
}
