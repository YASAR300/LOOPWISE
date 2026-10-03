"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Timer,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Send,
  RotateCcw,
  BookOpen,
  Award,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LogoLoader } from "@/components/ui/logo-loader";
import Link from "next/link";

export default function StrategistAssessmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(2700); // 45 mins default
  const [autosaving, setAutosaving] = useState(false);
  const [lastAutosaved, setLastAutosaved] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const timerRef = useRef(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  // Load assessment and active attempt
  useEffect(() => {
    async function initAssessment() {
      try {
        setLoading(true);
        const res = await fetch("/api/strategist/assessment");
        if (!res.ok) {
          const err = await res.json();
          setErrorMsg(err.error || "Failed to load skills assessment");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setAssessment(data.assessment);
        setAttempt(data.attempt);
        setQuestions(data.assessment.questions || []);

        const initialAnswers =
          data.attempt.answers && typeof data.attempt.answers === "object"
            ? data.attempt.answers
            : {};
        setAnswers(initialAnswers);

        if (
          data.attempt.timeRemainingSeconds !== undefined &&
          data.attempt.timeRemainingSeconds !== null
        ) {
          setTimeRemaining(data.attempt.timeRemainingSeconds);
        }

        // If attempt was already submitted and evaluated
        if (data.attempt.evaluatedAt) {
          setResult({
            score: data.attempt.score,
            passed: data.attempt.passed,
            aiEvaluations: data.attempt.aiEvaluations,
            evaluatedAt: data.attempt.evaluatedAt,
          });
        }
      } catch (err) {
        console.error("Assessment init error", err);
        setErrorMsg("Failed to connect to assessment server.");
      } finally {
        setLoading(false);
      }
    }

    initAssessment();
  }, []);

  // Server-synced countdown timer
  useEffect(() => {
    if (result || loading || !attempt) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [result, loading, attempt]);

  // Periodic autosave every 20 seconds
  useEffect(() => {
    if (result || loading || !attempt) return;

    const autoSaveInterval = setInterval(() => {
      triggerAutosave(answersRef.current);
    }, 20000);

    return () => clearInterval(autoSaveInterval);
  }, [result, loading, attempt]);

  const triggerAutosave = async (currentAnswers) => {
    if (!attempt?.id || result) return;
    try {
      setAutosaving(true);
      const res = await fetch("/api/strategist/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "autosave",
          attemptId: attempt.id,
          answers: currentAnswers,
        }),
      });
      if (res.ok) {
        setLastAutosaved(
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      }
    } catch (err) {
      console.error("Autosave failed", err);
    } finally {
      setAutosaving(false);
    }
  };

  const handleAutoSubmit = () => {
    handleSubmitAssessment();
  };

  const currentQuestion = questions[currentIndex];

  const updateAnswer = (questionId, value) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: value };
      return next;
    });
  };

  const handleRankMove = (questionId, itemIdx, direction) => {
    const rawOptions = currentQuestion?.options || [];
    const currentOrder = answers[questionId] || [...rawOptions];
    const targetIdx = itemIdx + direction;
    if (targetIdx < 0 || targetIdx >= currentOrder.length) return;

    const reordered = [...currentOrder];
    const temp = reordered[itemIdx];
    reordered[itemIdx] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    updateAnswer(questionId, reordered);
  };

  const handleSubmitAssessment = async () => {
    if (!attempt?.id) return;
    try {
      setSubmitting(true);
      setErrorMsg(null);

      const res = await fetch("/api/strategist/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          attemptId: attempt.id,
          answers,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || "Submission failed");
        setSubmitting(false);
        return;
      }

      setResult({
        score: json.score,
        passed: json.passed,
        aiEvaluations: json.aiEvaluations,
        evaluatedAt: json.evaluatedAt,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Submission failed", err);
      setErrorMsg("Error submitting assessment");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <LogoLoader />
        <p className="text-sm font-medium text-ink-3">
          Loading scenario assessment session...
        </p>
      </div>
    );
  }

  // ================= RESULT VIEW =================
  if (result) {
    const isPassing = result.passed;
    return (
      <div className="mx-auto max-w-4xl space-y-8 pb-20">
        <div className="bg-surface shadow-xs space-y-6 rounded-2xl border border-line p-8 text-center">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border ${
              isPassing
                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                : "border-amber-200 bg-amber-50 text-amber-600"
            }`}
          >
            {isPassing ? (
              <Award className="h-8 w-8" />
            ) : (
              <ShieldCheck className="h-8 w-8" />
            )}
          </div>

          <div>
            <Badge
              variant="outline"
              className={
                isPassing
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-amber-300 bg-amber-50 text-amber-700"
              }
            >
              {isPassing ? "Benchmark Passed" : "Under Admissions Review"}
            </Badge>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">
              Assessment Completed: {result.score}%
            </h1>
            <p className="mx-auto mt-1 max-w-lg text-sm text-ink-3">
              Your scenario responses, architectural decisions, and AI rubric
              evaluations have been compiled into your vetting dossier.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <Link href="/strategist/dashboard">
              <Button className="hover:bg-brand-indigo/90 bg-brand-indigo">
                Go to Strategist Dashboard{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* AI Rubric Score Details */}
        {result.aiEvaluations &&
          Object.keys(result.aiEvaluations).length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="text-brand-orange h-4 w-4" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
                  Rubric Evaluation Breakdown (Rubric v1.0)
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {Object.entries(result.aiEvaluations).map(([qId, evalData]) => (
                  <div
                    key={qId}
                    className="bg-surface shadow-xs space-y-3 rounded-xl border border-line p-5"
                  >
                    <div className="flex items-center justify-between border-b border-line pb-2">
                      <span className="text-xs font-semibold text-ink-2">
                        Scenario Question Evaluation
                      </span>
                      <Badge
                        variant="outline"
                        className="border-brand-indigo/30 font-bold text-brand-indigo"
                      >
                        Score: {evalData.score} / {evalData.maxScore || 5}
                      </Badge>
                    </div>
                    <p className="text-xs leading-relaxed text-ink">
                      <strong className="text-ink-2">
                        AI Evaluator Rationale:
                      </strong>{" "}
                      {evalData.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
    );
  }

  // ================= ACTIVE ASSESSMENT VIEW =================
  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k] !== undefined && answers[k] !== "" && answers[k] !== null
  ).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      {/* Top Banner: Status & Server Timer */}
      <div className="bg-surface shadow-xs flex flex-col gap-4 rounded-2xl border border-line p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-brand-orange/30 bg-brand-orange/5 text-brand-orange"
            >
              Timed Scenario Benchmark
            </Badge>
            {autosaving ? (
              <span className="text-2xs text-ink-3">Autosaving...</span>
            ) : lastAutosaved ? (
              <span className="text-2xs text-emerald-600">
                Saved {lastAutosaved}
              </span>
            ) : null}
          </div>
          <h1 className="mt-1 text-lg font-bold text-ink">
            {assessment?.title ||
              "Fractional Head of AI & Automation Assessment"}
          </h1>
          <p className="text-xs text-ink-3">
            Question {currentIndex + 1} of {questions.length} • {answeredCount}/
            {questions.length} Answered
          </p>
        </div>

        {/* Server-synced Timer Display */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div
            className={`shadow-xs flex items-center gap-2 rounded-xl border px-4 py-2 font-mono text-sm font-bold ${
              timeRemaining < 300
                ? "animate-pulse border-red-300 bg-red-50 text-red-700"
                : "border-line bg-canvas text-ink"
            }`}
          >
            <Timer className="h-4 w-4" />
            <span>{formatTimer(timeRemaining)}</span>
          </div>

          <Button
            size="sm"
            onClick={handleSubmitAssessment}
            disabled={submitting}
            className="hover:bg-brand-indigo/90 bg-brand-indigo"
          >
            {submitting ? "Scoring..." : "Submit Test"}
          </Button>
        </div>
      </div>

      {/* Question Jump Palette (25 questions) */}
      <div className="bg-surface shadow-xs rounded-xl border border-line p-3">
        <div className="flex flex-wrap gap-1.5">
          {questions.map((q, idx) => {
            const isAnswered =
              answers[q.id] !== undefined &&
              answers[q.id] !== "" &&
              answers[q.id] !== null;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id || idx}
                onClick={() => {
                  triggerAutosave(answers);
                  setCurrentIndex(idx);
                }}
                className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold transition-all ${
                  isCurrent
                    ? "shadow-xs border border-brand-indigo bg-brand-indigo text-white"
                    : isAnswered
                      ? "border border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "hover:border-line-hover border border-line bg-canvas text-ink-3"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      {currentQuestion && (
        <div className="bg-surface shadow-xs space-y-6 rounded-2xl border border-line p-6 md:p-8">
          {/* Domain & points badge */}
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-brand-indigo/30 bg-brand-indigo/5 font-semibold text-brand-indigo"
              >
                {currentQuestion.domain || "AI Architecture"}
              </Badge>
              <span className="text-ink-4 text-2xs font-semibold uppercase tracking-wider">
                Type: {currentQuestion.type?.replace("_", " ")}
              </span>
            </div>
            <span className="text-xs font-bold text-ink-3">
              {currentQuestion.points || 10} Points
            </span>
          </div>

          {/* Scenario Context Box */}
          {currentQuestion.scenario && (
            <div className="rounded-xl border border-line bg-canvas p-4 text-xs leading-relaxed text-ink-2">
              <span className="font-bold text-ink">Scenario Context: </span>
              {currentQuestion.scenario}
            </div>
          )}

          {/* Question Prompt */}
          <div className="space-y-2">
            <h2 className="text-base font-semibold leading-snug text-ink">
              {currentQuestion.prompt}
            </h2>
          </div>

          {/* Answer Controls Based on QuestionType */}
          <div className="pt-2">
            {/* 1. MULTIPLE_CHOICE */}
            {currentQuestion.type === "MULTIPLE_CHOICE" && (
              <div className="space-y-2.5">
                {(currentQuestion.options || []).map((opt, optIdx) => {
                  const isSelected = answers[currentQuestion.id] === opt;
                  return (
                    <div
                      key={optIdx}
                      onClick={() => updateAnswer(currentQuestion.id, opt)}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                        isSelected
                          ? "bg-brand-indigo/5 shadow-xs border-brand-indigo text-brand-indigo"
                          : "hover:border-line-hover border-line bg-canvas text-ink-2"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-brand-indigo bg-brand-indigo text-white"
                            : "border-line bg-white"
                        }`}
                      >
                        {isSelected && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-xs font-medium leading-relaxed">
                        {opt}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. RANKED_PRIORITY */}
            {currentQuestion.type === "RANKED_PRIORITY" && (
              <div className="space-y-3">
                <p className="text-xs text-ink-3">
                  Use the Up / Down controls to rank these actions from highest
                  priority (Rank 1) to lowest:
                </p>
                {(() => {
                  const currentList =
                    answers[currentQuestion.id] ||
                    currentQuestion.options ||
                    [];
                  return currentList.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="shadow-xs flex items-center justify-between rounded-xl border border-line bg-canvas p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="bg-brand-indigo/10 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-brand-indigo">
                          #{itemIdx + 1}
                        </span>
                        <span className="text-xs font-medium text-ink">
                          {item}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={itemIdx === 0}
                          onClick={() =>
                            handleRankMove(currentQuestion.id, itemIdx, -1)
                          }
                          className="hover:bg-surface rounded p-1 text-ink-3 hover:text-ink disabled:opacity-30"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={itemIdx === currentList.length - 1}
                          onClick={() =>
                            handleRankMove(currentQuestion.id, itemIdx, 1)
                          }
                          className="hover:bg-surface rounded p-1 text-ink-3 hover:text-ink disabled:opacity-30"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}

            {/* 3. FREE_TEXT */}
            {currentQuestion.type === "FREE_TEXT" && (
              <div className="space-y-3">
                <Textarea
                  rows={6}
                  placeholder="Detail your architecture, tool selections, failure mitigation, and guardrail policies..."
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) =>
                    updateAnswer(currentQuestion.id, e.target.value)
                  }
                  className="text-xs leading-relaxed"
                />
                <div className="text-ink-4 flex items-center justify-between text-2xs">
                  <span>
                    Evaluated against strict rubric criteria: Architecture,
                    Tooling, Safety, ROI.
                  </span>
                  <span>
                    {(answers[currentQuestion.id] || "").length} characters
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between border-t border-line pt-4">
        <Button
          variant="outline"
          disabled={currentIndex === 0}
          onClick={() => {
            triggerAutosave(answers);
            setCurrentIndex((prev) => Math.max(0, prev - 1));
          }}
          className="bg-surface gap-2 border-line hover:bg-canvas"
        >
          <ArrowLeft className="h-4 w-4" /> Previous Question
        </Button>

        <div className="flex items-center gap-3">
          {currentIndex < questions.length - 1 ? (
            <Button
              onClick={() => {
                triggerAutosave(answers);
                setCurrentIndex((prev) =>
                  Math.min(questions.length - 1, prev + 1)
                );
              }}
              className="hover:bg-brand-indigo/90 gap-2 bg-brand-indigo"
            >
              Next Question <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmitAssessment}
              disabled={submitting}
              className="bg-brand-orange hover:bg-brand-orange/90 gap-2 px-6 font-semibold text-white shadow-sm"
            >
              Finish & Score Assessment <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
