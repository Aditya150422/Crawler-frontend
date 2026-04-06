"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Loader2,
  SlidersHorizontal,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import { Badge, Button, Card, EmptyState, Progress } from "@/components/ui";
import { api } from "@/lib/api";
import { cn, extractDomain } from "@/lib/utils";
import { useAuthStore } from "@/store";
import type {
  QuizAnswerPayload,
  QuizCollectionInfo,
  QuizOption,
  QuizQuestion,
  QuizScopeMode,
  QuizStartResponse,
  QuizSubmitResponse,
} from "@/types";
import toast from "react-hot-toast";

const QUESTION_COUNT_OPTIONS = [5, 6, 7, 8, 9, 10];
const OPTION_LABELS: QuizOption[] = ["A", "B", "C", "D"];
const DEFAULT_MIN_SEMANTIC_SCORE = 0.35;
const DEFAULT_MAX_QUESTIONS_PER_URL = 2;
const DEFAULT_MIN_DISTINCT_URLS = 2;

export default function QuizzesPage() {
  const { user } = useAuthStore();
  const [collections, setCollections] = useState<QuizCollectionInfo[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [scopeMode, setScopeMode] = useState<QuizScopeMode>("focused");
  const [focusQuery, setFocusQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [minSemanticScore, setMinSemanticScore] = useState(DEFAULT_MIN_SEMANTIC_SCORE);
  const [maxQuestionsPerUrl, setMaxQuestionsPerUrl] = useState(DEFAULT_MAX_QUESTIONS_PER_URL);
  const [minDistinctUrls, setMinDistinctUrls] = useState(DEFAULT_MIN_DISTINCT_URLS);
  const [useLlmClassifier, setUseLlmClassifier] = useState(true);
  const [startError, setStartError] = useState<string | null>(null);

  const [isStartingQuiz, setIsStartingQuiz] = useState(false);
  const [quizSession, setQuizSession] = useState<QuizStartResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, QuizOption>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);

  useEffect(() => {
    loadQuizCollections();
  }, []);

  const loadQuizCollections = async () => {
    setIsLoadingCollections(true);
    try {
      const response = await api.getQuizCollections();
      setCollections(response.collections);
      if (!selectedCollectionId && response.collections.length > 0) {
        setSelectedCollectionId(response.collections[0].collection_id);
      }
    } catch (error) {
      toast.error((error as Error).message || "Failed to load quiz collections");
    } finally {
      setIsLoadingCollections(false);
    }
  };

  const currentQuestion: QuizQuestion | null =
    quizSession?.questions[currentQuestionIndex] || null;

  const answeredCount = useMemo(() => {
    if (!quizSession) return 0;
    return quizSession.questions.filter((q) => answers[q.id]).length;
  }, [quizSession, answers]);

  const handleStartQuiz = async () => {
    if (!selectedCollectionId) {
      toast.error("Please select a collection");
      return;
    }
    if (scopeMode === "focused" && !focusQuery.trim()) {
      toast.error("Focus query is required in focused mode");
      return;
    }

    setStartError(null);
    setIsStartingQuiz(true);
    try {
      const session = await api.startQuiz({
        collection_id: selectedCollectionId,
        question_count: questionCount,
        user_id: user?.id,
        scope_mode: scopeMode,
        focus_query: scopeMode === "focused" ? focusQuery.trim() : undefined,
        min_semantic_score: minSemanticScore,
        max_questions_per_url: maxQuestionsPerUrl,
        min_distinct_urls: minDistinctUrls,
        use_llm_classifier: scopeMode === "focused" ? useLlmClassifier : false,
      });
      setQuizSession(session);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setResult(null);
      setStartError(null);
    } catch (error) {
      const message = (error as Error).message || "Failed to start quiz";
      setStartError(message);
      if (message.includes("Not enough filtered MCQ questions")) {
        toast.error("Filtered pool is too small. Try broader quiz filters.");
      } else {
        toast.error(message);
      }
    } finally {
      setIsStartingQuiz(false);
    }
  };

  const handleSelectOption = (questionId: string, option: QuizOption) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmitQuiz = async () => {
    if (!quizSession) return;
    if (answeredCount !== quizSession.total_questions) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    const payload: QuizAnswerPayload[] = quizSession.questions.map((q) => ({
      question_id: q.id,
      selected_option: answers[q.id],
    }));

    setIsSubmitting(true);
    try {
      const submission = await api.submitQuiz(quizSession.quiz_session_id, {
        answers: payload,
      });
      setResult(submission);
    } catch (error) {
      toast.error((error as Error).message || "Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForNewAttempt = () => {
    setQuizSession(null);
    setResult(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setStartError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quizzes</h1>
          <p className="text-gray-400 text-sm mt-1">
            Test your understanding and get personalized improvement suggestions.
          </p>
        </div>
        {(quizSession || result) && (
          <Button variant="secondary" onClick={resetForNewAttempt} leftIcon={<Brain className="w-4 h-4" />}>
            Start New Quiz
          </Button>
        )}
      </div>

      {!quizSession && !result && (
        <Card className="p-6 space-y-6">
          {isLoadingCollections ? (
            <div className="flex items-center justify-center py-12 text-gray-300">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading quiz collections...
            </div>
          ) : collections.length === 0 ? (
            <EmptyState
              icon={Brain}
              title="No Quiz-Ready Collections"
              description="Collections with generated MCQ banks will appear here."
              action={
                <Button variant="primary" onClick={loadQuizCollections}>
                  Refresh
                </Button>
              }
            />
          ) : (
            <>
              <div>
                <h2 className="text-white font-semibold mb-3">1. Choose Collection</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {collections.map((collection) => {
                    const isSelected = selectedCollectionId === collection.collection_id;
                    return (
                      <button
                        key={collection.collection_id}
                        onClick={() => setSelectedCollectionId(collection.collection_id)}
                        className={cn(
                          "text-left p-4 rounded-xl border transition-all",
                          isSelected
                            ? "border-primary-500/60 bg-primary-500/10"
                            : "border-dark-600 bg-dark-800/50 hover:border-dark-500"
                        )}
                      >
                        <p className="text-sm font-medium text-white">{collection.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{extractDomain(collection.url)}</p>
                        <div className="mt-3">
                          <Badge variant="info">{collection.available_questions} questions available</Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="text-white font-semibold mb-3">2. Select Question Count (5-10)</h2>
                <div className="flex flex-wrap gap-2">
                  {QUESTION_COUNT_OPTIONS.map((count) => (
                    <Button
                      key={count}
                      variant={questionCount === count ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setQuestionCount(count)}
                    >
                      {count}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-white font-semibold mb-3">3. Scope Mode</h2>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={scopeMode === "focused" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setScopeMode("focused")}
                  >
                    Focused
                  </Button>
                  <Button
                    variant={scopeMode === "broad" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setScopeMode("broad")}
                  >
                    Broad
                  </Button>
                </div>
              </div>

              {scopeMode === "focused" && (
                <div className="space-y-3">
                  <div>
                    <h2 className="text-white font-semibold mb-2">4. Focus Query</h2>
                    <input
                      type="text"
                      value={focusQuery}
                      onChange={(e) => setFocusQuery(e.target.value)}
                      placeholder="e.g., Uzair Baloch"
                      className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-600 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50"
                    />
                  </div>
                  <label className="flex items-center justify-between p-3 rounded-xl border border-dark-700 bg-dark-800/40">
                    <span className="text-sm text-gray-300">Use LLM classifier (core-topic filter)</span>
                    <button
                      type="button"
                      onClick={() => setUseLlmClassifier((prev) => !prev)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative",
                        useLlmClassifier ? "bg-primary-500/60" : "bg-dark-600"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all",
                          useLlmClassifier ? "left-6" : "left-0.5"
                        )}
                      />
                    </button>
                  </label>
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowAdvancedFilters((prev) => !prev)}
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Advanced Filters {showAdvancedFilters ? "(Hide)" : "(Show)"}
                </button>

                {showAdvancedFilters && (
                  <div className="p-4 rounded-xl border border-dark-700 bg-dark-800/40 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-gray-300">Min semantic score</label>
                        <span className="text-xs text-primary-400">{minSemanticScore.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={minSemanticScore}
                        onChange={(e) => setMinSemanticScore(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-gray-300">Max questions per URL</label>
                        <input
                          type="number"
                          min={1}
                          value={maxQuestionsPerUrl}
                          onChange={(e) => setMaxQuestionsPerUrl(Math.max(1, Number(e.target.value) || 1))}
                          className="mt-1 w-full px-3 py-2 bg-dark-800/50 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-300">Min distinct URLs</label>
                        <input
                          type="number"
                          min={1}
                          value={minDistinctUrls}
                          onChange={(e) => setMinDistinctUrls(Math.max(1, Number(e.target.value) || 1))}
                          className="mt-1 w-full px-3 py-2 bg-dark-800/50 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {startError && startError.includes("Not enough filtered MCQ questions") && (
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
                  <p className="text-sm text-amber-300 font-medium">{startError}</p>
                  <p className="text-xs text-amber-200/80 mt-2">Try one of these:</p>
                  <ul className="mt-1 text-xs text-amber-100/90 list-disc pl-5 space-y-1">
                    <li>Lower min semantic score</li>
                    <li>Increase max questions per URL</li>
                    <li>Switch scope mode to Broad</li>
                  </ul>
                </div>
              )}

              <div className="pt-1">
                <Button
                  variant="primary"
                  onClick={handleStartQuiz}
                  isLoading={isStartingQuiz}
                  leftIcon={<Target className="w-4 h-4" />}
                >
                  Start Quiz
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      {quizSession && !result && currentQuestion && (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Badge variant="info">
                  Question {currentQuestionIndex + 1} / {quizSession.total_questions}
                </Badge>
                <Badge variant="default">
                  Answered {answeredCount} / {quizSession.total_questions}
                </Badge>
              </div>
              <div className="w-full sm:w-56">
                <Progress value={answeredCount} max={quizSession.total_questions} size="sm" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white leading-relaxed">
              {currentQuestion.question}
            </h2>

            <div className="mt-5 space-y-3">
              {OPTION_LABELS.map((option) => {
                const optionText = currentQuestion.options[option];
                const isSelected = answers[currentQuestion.id] === option;
                return (
                  <button
                    key={option}
                    onClick={() => handleSelectOption(currentQuestion.id, option)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all",
                      isSelected
                        ? "border-primary-500/60 bg-primary-500/10"
                        : "border-dark-600 bg-dark-800/40 hover:border-dark-500"
                    )}
                  >
                    <span className="text-xs text-gray-400">{option}.</span>
                    <span className="ml-2 text-sm text-gray-200">{optionText}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setCurrentQuestionIndex((prev) =>
                      Math.min(quizSession.total_questions - 1, prev + 1)
                    )
                  }
                  disabled={currentQuestionIndex === quizSession.total_questions - 1}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>

              <Button
                variant="primary"
                onClick={handleSubmitQuiz}
                isLoading={isSubmitting}
                disabled={answeredCount !== quizSession.total_questions}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Submit Quiz
              </Button>
            </div>
          </Card>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Quiz Result</h2>
                <p className="text-sm text-gray-400">Session: {result.quiz_session_id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-dark-800/60 border border-dark-700">
                <p className="text-xs text-gray-400">Score</p>
                <p className="text-2xl font-bold text-white">
                  {result.score} / {result.total_questions}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-dark-800/60 border border-dark-700">
                <p className="text-xs text-gray-400">Percentage</p>
                <p className="text-2xl font-bold text-primary-400">{result.percentage.toFixed(1)}%</p>
              </div>
              <div className="p-4 rounded-xl bg-dark-800/60 border border-dark-700">
                <p className="text-xs text-gray-400">Wrong Answers</p>
                <p className="text-2xl font-bold text-rose-400">{result.wrong_answers.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">LLM Study Suggestions</h3>
            </div>
            <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
              {result.llm_suggestions || "No suggestions returned yet."}
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Wrong Answers Review</h3>
            {result.wrong_answers.length === 0 ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">Perfect score. No wrong answers to review.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {result.wrong_answers.map((wrong, idx) => (
                  <div key={`${wrong.question_id}-${idx}`} className="p-4 rounded-xl border border-dark-700 bg-dark-800/40">
                    <p className="text-sm text-white font-medium">{wrong.question}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="error">
                        <XCircle className="w-3 h-3 mr-1 inline" />
                        Your answer: {wrong.selected_option}
                      </Badge>
                      <Badge variant="success">
                        <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                        Correct: {wrong.correct_option}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-gray-300">{wrong.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </motion.div>
  );
}
