'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, HelpCircle, ChevronRight, CheckCircle2, XCircle, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { SparkyReaction } from '@/components/sparky/SparkyReaction'
import { SparkyBubble } from '@/components/sparky/SparkyBubble'
import type { Question, McqOption } from '@/types/database.types'

interface QuizEngineProps {
  questions: Question[]
  timeLimitMinutes?: number | null
  onComplete: (answers: Record<string, string>, score: number, totalPoints: number) => void
  onRequestHint?: (question: Question) => Promise<string>
}

interface AnswerState {
  selectedAnswer: string | null
  isCorrect: boolean | null
  showExplanation: boolean
}

export function QuizEngine({ questions, timeLimitMinutes, onComplete, onRequestHint }: QuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [answerState, setAnswerState] = useState<AnswerState>({
    selectedAnswer: null,
    isCorrect: null,
    showExplanation: false,
  })
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimitMinutes ? timeLimitMinutes * 60 : null)
  const [hintText, setHintText] = useState<string | null>(null)
  const [showReaction, setShowReaction] = useState(false)
  const [reactionType, setReactionType] = useState<'correct' | 'incorrect'>('correct')
  const [quizComplete, setQuizComplete] = useState(false)

  const currentQuestion = questions[currentIndex]
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          handleQuizComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const handleQuizComplete = useCallback(() => {
    setQuizComplete(true)
    onComplete(answers, score, totalPoints)
  }, [answers, score, totalPoints, onComplete])

  const handleAnswer = (answerId: string) => {
    if (answerState.selectedAnswer) return

    const isCorrect = checkAnswer(currentQuestion, answerId)

    setAnswerState({
      selectedAnswer: answerId,
      isCorrect,
      showExplanation: true,
    })

    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answerId }))

    if (isCorrect) {
      setScore((prev) => prev + currentQuestion.points)
      setReactionType('correct')
    } else {
      setReactionType('incorrect')
    }

    setShowReaction(true)
  }

  const handleNext = () => {
    setAnswerState({ selectedAnswer: null, isCorrect: null, showExplanation: false })
    setHintText(null)

    if (currentIndex + 1 >= questions.length) {
      handleQuizComplete()
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handleHint = async () => {
    if (!onRequestHint || hintText) return
    const hint = await onRequestHint(currentQuestion)
    setHintText(hint)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (quizComplete) {
    const percentage = Math.round((score / totalPoints) * 100)
    const passed = percentage >= 70
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <SparkyReaction
          type={passed ? 'correct' : 'incorrect'}
          show={true}
          message={passed ? `Amazing! You scored ${percentage}%!` : `You scored ${percentage}%. Keep trying!`}
        />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-display font-bold text-text-secondary">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <Progress value={currentIndex + 1} max={questions.length} className="w-32" />
        </div>

        <div className="flex items-center gap-3">
          {timeLeft !== null && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono font-bold text-sm ${
              timeLeft < 30 ? 'bg-secondary/10 text-secondary animate-pulse' : 'bg-border text-text-primary'
            }`}>
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-primary/10 rounded-full px-3 py-1.5">
            <span className="text-sm font-mono font-bold text-primary">{score}/{totalPoints}</span>
          </div>
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="bg-card rounded-2xl border border-border p-8 shadow-lg"
        >
          <h2 className="text-xl font-display font-bold text-text-primary mb-6">
            {currentQuestion.question_text}
          </h2>

          {currentQuestion.media_url && (
            <img
              src={currentQuestion.media_url}
              alt="Question media"
              className="w-full max-h-48 object-contain rounded-xl mb-6"
            />
          )}

          {/* MCQ Options */}
          {(currentQuestion.question_type === 'multiple_choice' || currentQuestion.question_type === 'true_false') && (
            <div className="space-y-3">
              {(currentQuestion.options as McqOption[]).map((option, i) => {
                const letter = String.fromCharCode(65 + i)
                const isSelected = answerState.selectedAnswer === option.id
                const isCorrectOption = option.is_correct
                const showResult = answerState.showExplanation

                let optionClass = 'border-border hover:border-primary/50 hover:bg-primary/5'
                if (showResult && isCorrectOption) {
                  optionClass = 'border-success bg-success/10'
                } else if (showResult && isSelected && !isCorrectOption) {
                  optionClass = 'border-secondary bg-secondary/10'
                } else if (isSelected) {
                  optionClass = 'border-primary bg-primary/10'
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(option.id)}
                    disabled={!!answerState.selectedAnswer}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${optionClass} ${
                      !answerState.selectedAnswer ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <span className={`h-8 w-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
                      showResult && isCorrectOption
                        ? 'bg-success text-white'
                        : showResult && isSelected
                        ? 'bg-secondary text-white'
                        : 'bg-border text-text-secondary'
                    }`}>
                      {showResult && isCorrectOption ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : showResult && isSelected ? (
                        <XCircle className="h-5 w-5" />
                      ) : (
                        letter
                      )}
                    </span>
                    <span className="text-left font-medium text-text-primary">{option.text}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Fill in the blank */}
          {currentQuestion.question_type === 'fill_blank' && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Type your answer..."
                className="w-full h-14 px-4 rounded-xl border-2 border-border text-lg font-medium focus:outline-none focus:border-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAnswer((e.target as HTMLInputElement).value)
                  }
                }}
                disabled={!!answerState.selectedAnswer}
              />
              {!answerState.selectedAnswer && (
                <p className="text-sm text-text-secondary">Press Enter to submit your answer</p>
              )}
            </div>
          )}

          {/* Short answer */}
          {currentQuestion.question_type === 'short_answer' && (
            <div className="space-y-4">
              <textarea
                placeholder="Write your answer..."
                className="w-full h-32 px-4 py-3 rounded-xl border-2 border-border text-base font-medium resize-none focus:outline-none focus:border-primary"
                disabled={!!answerState.selectedAnswer}
              />
              {!answerState.selectedAnswer && (
                <Button onClick={() => {
                  const textarea = document.querySelector('textarea') as HTMLTextAreaElement
                  if (textarea?.value) handleAnswer(textarea.value)
                }}>
                  Submit Answer
                </Button>
              )}
            </div>
          )}

          {/* Explanation */}
          {answerState.showExplanation && currentQuestion.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-info/5 rounded-xl border border-info/20"
            >
              <p className="text-sm font-semibold text-info mb-1">Explanation</p>
              <p className="text-sm text-text-secondary">{currentQuestion.explanation}</p>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-8">
            {!answerState.selectedAnswer ? (
              <Button variant="ghost" size="sm" onClick={handleHint} disabled={!!hintText}>
                <HelpCircle className="h-4 w-4" />
                {hintText ? 'Hint shown' : 'Use Hint'}
                <Coins className="h-4 w-4 text-accent" />
                <span className="text-accent font-mono">5</span>
              </Button>
            ) : (
              <div />
            )}

            {answerState.selectedAnswer && (
              <Button onClick={handleNext} size="lg">
                {currentIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Hint Bubble */}
      {hintText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <SparkyBubble message={hintText} mood="thinking" sparkySize={60} />
        </motion.div>
      )}

      {/* Reaction overlay - brief flash */}
      <SparkyReaction
        type={reactionType}
        show={showReaction}
        onComplete={() => setShowReaction(false)}
      />
    </div>
  )
}

function checkAnswer(question: Question, answer: string): boolean {
  if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
    const options = question.options as McqOption[]
    const selected = options.find((o) => o.id === answer)
    return selected?.is_correct ?? false
  }

  if (question.question_type === 'fill_blank') {
    const correctAnswers = question.correct_answer as string[]
    return correctAnswers.some(
      (correct) => correct.toLowerCase().trim() === answer.toLowerCase().trim()
    )
  }

  return false
}
