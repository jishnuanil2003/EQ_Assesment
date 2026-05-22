import { useState, useEffect, useRef } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const API_BASE = "http://localhost:8000";

// ─── Design tokens ───────────────────────────────────────────────
const C = {
  bg: "#0B0F1A",
  surface: "#131929",
  card: "#1A2236",
  border: "#243050", 
  accent: "#5EEAD4",
  accentDim: "#1E4A43",
  gold: "#F5C542",
  text: "#E8EDF5",
  muted: "#6B7FA3",
  danger: "#FF6B6B",
};

const EMO_COLORS = {
  joy: "#F5C542",
  surprise: "#5EEAD4",
  neutral: "#6B7FA3",
  fear: "#9B7FE8",
  anger: "#FF6B6B",
  disgust: "#FF9F43",
  sadness: "#4FC3F7",
};

// ─── Helpers ──────────────────────────────────────────────────────
const scoreColor = (s) => {
  if (s >= 85) return "#00C9A7";
  if (s >= 70) return "#4FC3F7";
  if (s >= 55) return "#FFD54F";
  return "#FF7043";
};

function CircleScore({ value, size = 140 }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = scoreColor(value);

  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke={C.border} strokeWidth="10" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
        style={{ transition: "stroke-dashoffset 1.2s ease" }}
      />
      <text x="60" y="56" textAnchor="middle" fill={color} fontSize="22" fontWeight="700" fontFamily="'DM Mono', monospace">
        {value}
      </text>
      <text x="60" y="72" textAnchor="middle" fill={C.muted} fontSize="9" fontFamily="'DM Sans', sans-serif">
        / 100
      </text>
    </svg>
  );
}

function Pill({ label, color }) {
  return (
    <span style={{
      background: color + "22",
      color,
      border: `1px solid ${color}55`,
      borderRadius: 20,
      padding: "3px 12px",
      fontSize: 12,
      fontFamily: "'DM Mono', monospace",
      letterSpacing: 1,
    }}>{label}</span>
  );
}

// ─── Step 1 — Landing ─────────────────────────────────────────────
function LandingStep({ onSubmit }) {
  const [form, setForm] = useState({ age: "", gender: "", profession: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.age || !form.gender || !form.profession) {
      setErr("Please fill in all fields.");
      return;
    }
    if (isNaN(form.age) || +form.age < 16 || +form.age > 80) {
      setErr("Please enter a valid age (16–80).");
      return;
    }
    setErr("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/scenario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ age: +form.age, gender: form.gender, profession: form.profession }),
      });
      if (!res.ok) throw new Error("Failed to fetch scenario");
      const data = await res.json();
      onSubmit({ profile: { ...form, age: +form.age }, scenario: data.scenario, questions: data.questions });
    } catch (e) {
      setErr("Could not reach the server. Is FastAPI running?");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    color: C.text,
    padding: "14px 16px",
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "60px 24px 40px" }}>
      {/* Header */}
      <div style={{ marginBottom: 48, textAlign: "center" }}>
        <div style={{ fontSize: 13, letterSpacing: 4, color: C.accent, fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>
          EMOTIONAL INTELLIGENCE
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 800, color: C.text, margin: 0, lineHeight: 1.1, fontFamily: "'DM Sans', sans-serif" }}>
          EQ<br />
          <span style={{ color: C.accent }}>Assessment</span>
        </h1>
        <p style={{ color: C.muted, marginTop: 16, lineHeight: 1.6, fontSize: 15 }}>
          A transformer-powered deep-dive into your emotional intelligence. Takes ~5 minutes.
        </p>
      </div>

      {/* Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ color: C.muted, fontSize: 12, letterSpacing: 2, fontFamily: "'DM Mono', monospace" }}>AGE</label>
          <input
            type="number"
            placeholder="e.g. 28"
            value={form.age}
            onChange={set("age")}
            style={{ ...inputStyle, marginTop: 6 }}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>
        <div>
          <label style={{ color: C.muted, fontSize: 12, letterSpacing: 2, fontFamily: "'DM Mono', monospace" }}>GENDER</label>
          <select
            value={form.gender}
            onChange={set("gender")}
            style={{ ...inputStyle, marginTop: 6 }}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
        <div>
          <label style={{ color: C.muted, fontSize: 12, letterSpacing: 2, fontFamily: "'DM Mono', monospace" }}>PROFESSION</label>
          <input
            type="text"
            placeholder="e.g. Engineer, Medical, Educator, etc."
            value={form.profession}
            onChange={set("profession")}
            style={{ ...inputStyle, marginTop: 6 }}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>

        {err && (
          <div style={{ color: C.danger, fontSize: 13, background: "#FF6B6B11", border: `1px solid ${C.danger}44`, borderRadius: 8, padding: "10px 14px" }}>
            {err}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            marginTop: 8,
            background: loading ? C.accentDim : C.accent,
            color: "#0B0F1A",
            fontWeight: 700,
            fontSize: 16,
            border: "none",
            borderRadius: 12,
            padding: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.2s",
          }}
        >
          {loading ? "Generating Scenario…" : "Begin Assessment →"}
        </button>
      </div>

      {/* Footer note */}
      <p style={{ color: C.muted, fontSize: 12, textAlign: "center", marginTop: 32, lineHeight: 1.7 }}>
        Powered by HuggingFace Transformers<br />
        <span style={{ color: C.border }}>distilbert-sst2 · emotion-distilroberta</span>
      </p>
    </div>
  );
}

// ─── Step 2 — Questions ───────────────────────────────────────────
function QuestionsStep({ scenario, questions, profile, onSubmit }) {
  const [answers, setAnswers] = useState(questions.map(() => ""));
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const setAnswer = (i, val) => setAnswers((a) => { const n = [...a]; n[i] = val; return n; });

  const wordCount = (s) => s.trim().split(/\s+/).filter(Boolean).length;

  const handleNext = () => {
    if (wordCount(answers[current]) < 10) {
      setErr("Please write at least 10 words for a meaningful analysis.");
      return;
    }
    setErr("");
    if (current < questions.length - 1) setCurrent(current + 1);
  };

  const handleSubmit = async () => {
    if (wordCount(answers[current]) < 10) {
      setErr("Please write at least 10 words.");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${API_BASE}/api/assess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          questions,
          answers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Assessment failed");
      onSubmit(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px" }}>
      {/* Scenario Card */}
      <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderLeft: `4px solid ${C.accent}`,
        borderRadius: 12,
        padding: "20px 24px",
        marginBottom: 36,
      }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: C.accent, fontFamily: "'DM Mono', monospace", marginBottom: 10 }}>
          YOUR SCENARIO
        </div>
        <p style={{ color: C.text, lineHeight: 1.7, margin: 0, fontSize: 15 }}>{scenario}</p>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: C.muted, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
          QUESTION {current + 1} / {questions.length}
        </span>
        <span style={{ color: C.accent, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{Math.round(progress)}%</span>
      </div>
      <div style={{ height: 4, background: C.border, borderRadius: 2, marginBottom: 28 }}>
        <div style={{ width: `${progress}%`, height: "100%", background: C.accent, borderRadius: 2, transition: "width 0.4s ease" }} />
      </div>

      {/* Question */}
      <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "28px",
      }}>
        <p style={{ color: C.text, fontSize: 17, fontWeight: 600, lineHeight: 1.6, margin: "0 0 20px", fontFamily: "'DM Sans', sans-serif" }}>
          {questions[current]}
        </p>
        <textarea
          value={answers[current]}
          onChange={(e) => setAnswer(current, e.target.value)}
          placeholder="Write your honest, thoughtful response here…"
          rows={5}
          style={{
            width: "100%",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            color: C.text,
            padding: "14px 16px",
            fontSize: 15,
            fontFamily: "'DM Sans', sans-serif",
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
            lineHeight: 1.6,
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <span style={{ color: wordCount(answers[current]) >= 10 ? C.accent : C.muted, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
            {wordCount(answers[current])} words {wordCount(answers[current]) >= 10 ? "✓" : "(min 10)"}
          </span>
        </div>
      </div>

      {err && (
        <div style={{ color: C.danger, fontSize: 13, background: "#FF6B6B11", border: `1px solid ${C.danger}44`, borderRadius: 8, padding: "10px 14px", marginTop: 12 }}>
          {err}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        {current > 0 && (
          <button
            onClick={() => { setCurrent(current - 1); setErr(""); }}
            style={{
              flex: 1,
              background: "transparent",
              border: `1px solid ${C.border}`,
              color: C.muted,
              borderRadius: 10,
              padding: "14px",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
            }}
          >
            ← Back
          </button>
        )}
        {current < questions.length - 1 ? (
          <button
            onClick={handleNext}
            style={{
              flex: 2,
              background: C.accent,
              color: "#0B0F1A",
              fontWeight: 700,
              fontSize: 15,
              border: "none",
              borderRadius: 10,
              padding: "14px",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Next Question →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              flex: 2,
              background: loading ? C.accentDim : C.gold,
              color: "#0B0F1A",
              fontWeight: 700,
              fontSize: 15,
              border: "none",
              borderRadius: 10,
              padding: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {loading ? "Analysing with AI…" : "Submit & Get Results →"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Step 3 — Results ─────────────────────────────────────────────
function ResultsStep({ data, onRestart }) {
  const { profile, eq_scores, interpretation, breakdown } = data;
  const [activeTab, setActiveTab] = useState("overview");

  const barData = Object.entries(eq_scores.categories).map(([name, value]) => ({
    name: name.replace(" & ", "\n& "),
    value,
    fill: scoreColor(value),
  }));

  const radarData = Object.entries(eq_scores.categories).map(([name, value]) => ({
    category: name.split(" ")[0],
    score: value,
  }));

  const TabBtn = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        background: activeTab === id ? C.accent : "transparent",
        color: activeTab === id ? "#0B0F1A" : C.muted,
        border: `1px solid ${activeTab === id ? C.accent : C.border}`,
        borderRadius: 8,
        padding: "8px 18px",
        cursor: "pointer",
        fontSize: 13,
        fontFamily: "'DM Mono', monospace",
        letterSpacing: 1,
        transition: "all 0.2s",
      }}
    >{label}</button>
  );

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: C.accent, fontFamily: "'DM Mono', monospace", marginBottom: 12 }}>
          ASSESSMENT COMPLETE
        </div>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: C.text, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
          {profile.profession} · {profile.gender} · {profile.age}
        </h2>
      </div>

      {/* Overall Score Card */}
      <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: "32px",
        display: "flex",
        alignItems: "center",
        gap: 32,
        marginBottom: 24,
        flexWrap: "wrap",
      }}>
        <CircleScore value={eq_scores.overall} size={140} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ marginBottom: 8 }}>
            <Pill label={interpretation.level} color={interpretation.color} />
          </div>
          <p style={{ color: C.text, lineHeight: 1.7, margin: "12px 0", fontSize: 15 }}>
            {interpretation.description}
          </p>
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginTop: 12 }}>
            <div style={{ color: C.muted, fontSize: 11, letterSpacing: 2, marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>
              DEVELOPMENT SUGGESTIONS
            </div>
            {interpretation.suggestions.map((s, i) => (
              <div key={i} style={{ color: C.text, fontSize: 13, marginBottom: 4, display: "flex", gap: 8 }}>
                <span style={{ color: C.accent }}>→</span> {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <TabBtn id="overview" label="OVERVIEW" />
        <TabBtn id="breakdown" label="BREAKDOWN" />
        <TabBtn id="emotions" label="EMOTIONS" />
      </div>

      {/* Tab: Overview — Bar + Radar */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "24px" }}>
            <div style={{ color: C.muted, fontSize: 11, letterSpacing: 3, marginBottom: 20, fontFamily: "'DM Mono', monospace" }}>
              EQ CATEGORIES — BAR CHART
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: C.muted, fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: C.text, fontSize: 12 }} width={130} />
                <Tooltip
                  cursor={{ fill: C.surface }}
                  contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "24px" }}>
            <div style={{ color: C.muted, fontSize: 11, letterSpacing: 3, marginBottom: 20, fontFamily: "'DM Mono', monospace" }}>
              EQ CATEGORIES — RADAR
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke={C.border} />
                <PolarAngleAxis dataKey="category" tick={{ fill: C.muted, fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: C.muted, fontSize: 10 }} />
                <Radar dataKey="score" stroke={C.accent} fill={C.accent} fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab: Breakdown */}
      {activeTab === "breakdown" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {breakdown.map((item, i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px" }}>
              <div style={{ color: C.muted, fontSize: 11, letterSpacing: 2, marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>
                Q{i + 1}
              </div>
              <p style={{ color: C.text, fontWeight: 600, margin: "0 0 10px", lineHeight: 1.5 }}>{item.question}</p>
              <p style={{ color: C.muted, fontSize: 14, margin: "0 0 14px", lineHeight: 1.6, fontStyle: "italic" }}>"{item.answer}"</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Pill
                  label={`Sentiment: ${item.sentiment.label} (${(item.sentiment.score * 100).toFixed(0)}%)`}
                  color={item.sentiment.label === "POSITIVE" ? "#00C9A7" : "#FF6B6B"}
                />
                <Pill
                  label={`Emotion: ${item.dominant_emotion.label} (${(item.dominant_emotion.score * 100).toFixed(0)}%)`}
                  color={EMO_COLORS[item.dominant_emotion.label] || C.accent}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Emotions */}
      {activeTab === "emotions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {breakdown.map((item, i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px" }}>
              <div style={{ color: C.muted, fontSize: 11, letterSpacing: 2, marginBottom: 4, fontFamily: "'DM Mono', monospace" }}>Q{i + 1} EMOTION DISTRIBUTION</div>
              <p style={{ color: C.text, fontSize: 13, margin: "0 0 14px" }}>{item.question}</p>
              {item.all_emotions.map((e) => (
                <div key={e.label} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ color: EMO_COLORS[e.label] || C.muted, fontSize: 12, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>{e.label}</span>
                    <span style={{ color: C.muted, fontSize: 12 }}>{(e.score * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 6, background: C.border, borderRadius: 3 }}>
                    <div style={{
                      width: `${e.score * 100}%`,
                      height: "100%",
                      background: EMO_COLORS[e.label] || C.accent,
                      borderRadius: 3,
                      transition: "width 0.8s ease",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Restart */}
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <button
          onClick={onRestart}
          style={{
            background: "transparent",
            border: `1px solid ${C.border}`,
            color: C.muted,
            borderRadius: 10,
            padding: "12px 28px",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
          }}
        >
          ↺ Start New Assessment
        </button>
      </div>
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState("landing"); // landing | questions | results
  const [sessionData, setSessionData] = useState({});

  const handleLanding = (data) => {
    setSessionData(data);
    setStep("questions");
  };

  const handleQuestions = (results) => {
    setSessionData((d) => ({ ...d, results }));
    setStep("results");
  };

  const handleRestart = () => {
    setSessionData({});
    setStep("landing");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        textarea, input, select { color-scheme: dark; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
      `}</style>

      {/* Nav bar */}
      <div style={{
        borderBottom: `1px solid ${C.border}`,
        padding: "14px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        background: C.bg + "ee",
        backdropFilter: "blur(10px)",
        zIndex: 100,
      }}>
        <span style={{ fontFamily: "'DM Mono', monospace", color: C.accent, fontSize: 14, letterSpacing: 2 }}>EQ·ASSESS</span>
        <span style={{ color: C.muted, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
          {step === "landing" ? "PROFILE" : step === "questions" ? "ASSESSMENT" : "RESULTS"}
        </span>
      </div>

      {step === "landing" && <LandingStep onSubmit={handleLanding} />}
      {step === "questions" && (
        <QuestionsStep
          scenario={sessionData.scenario}
          questions={sessionData.questions}
          profile={sessionData.profile}
          onSubmit={handleQuestions}
        />
      )}
      {step === "results" && <ResultsStep data={sessionData.results} onRestart={handleRestart} />}
    </div>
  );
}