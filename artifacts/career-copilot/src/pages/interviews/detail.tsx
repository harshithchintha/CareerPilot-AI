import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "wouter";
import { 
  useGetInterview, 
  useGetNextQuestion, 
  useSubmitAnswer,
  useCompleteInterview,
  getGetInterviewQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft,
  Bot,
  User,
  Send,
  Loader2,
  Award,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Sparkles,
  HelpCircle,
  CheckCircle2
} from "lucide-react";

export default function InterviewDetailPage() {
  const { id } = useParams();
  const interviewId = parseInt(id!);
  const queryClient = useQueryClient();

  const { data: interview, isLoading: interviewLoading } = useGetInterview(interviewId, { 
    query: { enabled: !!interviewId, queryKey: getGetInterviewQueryKey(interviewId) } 
  });
  
  const getNextQuestionMutation = useGetNextQuestion();
  const submitAnswer = useSubmitAnswer();
  const completeInterview = useCompleteInterview();
  
  const [answerText, setAnswerText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const nextQuestion = getNextQuestionMutation.data;

  useEffect(() => {
    if (interview && interview.status === 'in_progress' && !nextQuestion && !getNextQuestionMutation.isPending) {
      getNextQuestionMutation.mutate({ id: interviewId });
    }
  }, [interview, interviewId, nextQuestion, getNextQuestionMutation]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [interview?.questions, nextQuestion]);

  // Read out loud using Web Speech API
  const speakQuestion = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Voice to text input using Web Speech Recognition
  const toggleSpeechToText = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your response.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setAnswerText((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim() || !nextQuestion) return;
    
    if (isSpeaking && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    submitAnswer.mutate({
      id: interviewId,
      data: { questionId: nextQuestion.id, answer: answerText }
    }, {
      onSuccess: () => {
        setAnswerText("");
        queryClient.invalidateQueries({ queryKey: getGetInterviewQueryKey(interviewId) });
        getNextQuestionMutation.mutate({ id: interviewId });
      }
    });
  };

  const handleComplete = () => {
    if (confirm("Are you ready to complete this mock interview session and view your complete performance scorecard?")) {
      completeInterview.mutate({ id: interviewId }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetInterviewQueryKey(interviewId) });
        }
      });
    }
  };

  if (interviewLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!interview) {
    return <div className="p-8 text-center text-muted-foreground">Interview session not found.</div>;
  }

  const isCompleted = interview.status === 'completed';

  return (
    <div className="flex flex-col h-[calc(100dvh-8rem)] animate-in fade-in duration-500">
      {/* Header Bar */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
          <Link href="/interviews" className="text-xs font-medium text-muted-foreground hover:text-secondary mb-1 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Mock Interviews
          </Link>
          <h1 className="text-2xl font-bold font-serif text-secondary flex items-center gap-3">
            {interview.role} Mock Interview
            <span className={`text-xs px-2.5 py-0.5 rounded font-sans uppercase tracking-wider font-bold ${
              isCompleted ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              {interview.status.replace('_', ' ')}
            </span>
          </h1>
        </div>
        
        {!isCompleted && interview.answeredQuestions > 0 && (
          <button 
            onClick={handleComplete}
            disabled={completeInterview.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-lg text-xs font-bold transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/90 h-9 px-4"
          >
            {completeInterview.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Session & Score"}
          </button>
        )}
      </div>

      {/* Completion Banner Scorecard */}
      {isCompleted && interview.overallScore && (
        <div className="bg-card border border-emerald-200 rounded-xl p-5 mb-4 shrink-0 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex flex-col items-center justify-center shrink-0 border border-emerald-300">
              <span className="text-lg font-bold">{Math.round(interview.overallScore)}</span>
              <span className="text-[9px] font-bold uppercase">/ 10 Score</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-secondary flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Session Completed - Evaluation Summary
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{interview.overallFeedback}</p>
            </div>
          </div>
        </div>
      )}

      {/* STAR Method Helper Bar */}
      {!isCompleted && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4 shrink-0 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-medium text-primary">
            <Sparkles className="w-4 h-4" />
            <span>Pro Tip: Use the <strong>STAR Method</strong> (Situation, Task, Action, Result) for behavioral answers!</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Speech Recognition & TTS Enabled</span>
          </div>
        </div>
      )}

      {/* Chat Conversation Area */}
      <div className="flex-1 bg-card border rounded-xl overflow-hidden shadow-sm flex flex-col min-h-0">
        <div className="bg-muted/30 p-3.5 border-b flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 font-medium text-xs text-secondary">
            <Bot className="w-4 h-4 text-primary" /> AI Senior Interviewer
          </div>
          <div className="text-xs font-semibold text-muted-foreground">
            Questions Answered: {interview.answeredQuestions} / {interview.totalQuestions}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* History */}
          {interview.questions.map((q) => (
            <div key={q.id} className="space-y-4">
              {/* Question */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="bg-muted/40 rounded-2xl rounded-tl-none p-4 text-secondary text-sm leading-relaxed border border-border relative group">
                    {q.question}
                    <button
                      onClick={() => speakQuestion(q.question)}
                      className="ml-2 text-muted-foreground hover:text-primary transition-colors"
                      title="Listen to question audio"
                    >
                      <Volume2 className="w-4 h-4 inline" />
                    </button>
                  </div>
                </div>
              </div>

              {/* User Answer */}
              {q.userAnswer && (
                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 flex flex-col items-end">
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-none p-4 text-sm leading-relaxed max-w-[85%] shadow-xs">
                      {q.userAnswer}
                    </div>
                  </div>
                </div>
              )}

              {/* AI Answer Evaluation Feedback */}
              {q.feedback && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-amber-50/70 rounded-2xl rounded-tl-none p-4 border border-amber-200/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                          AI Answer Evaluation & Analysis
                        </span>
                        <span className="text-xs font-bold bg-amber-200/80 text-amber-900 px-2.5 py-0.5 rounded-full">
                          Score: {q.score} / 10
                        </span>
                      </div>
                      <p className="text-xs text-amber-950/80 leading-relaxed">{q.feedback}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Active Next Question */}
          {!isCompleted && nextQuestion && (
            <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="bg-muted/40 rounded-2xl rounded-tl-none p-4 text-secondary text-sm leading-relaxed border border-border shadow-xs flex items-start justify-between gap-2">
                  <span>{nextQuestion.question}</span>
                  <button
                    onClick={() => speakQuestion(nextQuestion.question)}
                    className="text-primary hover:text-primary/80 shrink-0 p-1 rounded hover:bg-primary/10 transition-colors"
                    title="Audio playback"
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading Indicators */}
          {!isCompleted && getNextQuestionMutation.isPending && (
            <div className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-muted shrink-0"></div>
              <div className="w-2/3 h-14 bg-muted rounded-2xl rounded-tl-none"></div>
            </div>
          )}

          {submitAnswer.isPending && (
            <div className="flex gap-3 flex-row-reverse animate-pulse">
              <div className="w-8 h-8 rounded-full bg-muted shrink-0"></div>
              <div className="w-1/2 h-12 bg-muted rounded-2xl rounded-tr-none"></div>
            </div>
          )}

          <div ref={endOfMessagesRef} />
        </div>

        {/* Input Text/Voice Form Area */}
        {!isCompleted && nextQuestion && (
          <form onSubmit={handleSubmit} className="p-4 border-t bg-muted/10 shrink-0 space-y-2">
            <div className="flex gap-2 items-center">
              <button
                type="button"
                onClick={toggleSpeechToText}
                className={`p-3 rounded-xl border transition-colors shrink-0 ${
                  isListening
                    ? "bg-red-500 text-white border-red-600 animate-pulse"
                    : "bg-background text-muted-foreground hover:text-foreground border-input"
                }`}
                title={isListening ? "Listening... Click to stop" : "Voice Input (Speech to Text)"}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <textarea 
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder={isListening ? "Listening... Speak your answer now..." : "Type or speak your answer here..."}
                className="flex-1 min-h-[52px] max-h-[140px] rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-y"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />

              <button 
                type="submit"
                disabled={!answerText.trim() || submitAnswer.isPending}
                className="shrink-0 w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-xs"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="text-[11px] text-muted-foreground text-center">
              Press <kbd className="font-mono bg-muted px-1 rounded">Enter</kbd> to submit answer, or use <Mic className="w-3 h-3 inline text-primary" /> for speech input.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}