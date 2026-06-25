import { useState, useEffect } from "react";

const QUESTIONS = [
  {
    id: "q1",
    label: "¿Quién mete el PRIMER gol del partido?",
    type: "radio",
    options: ["México 🇲🇽", "Chequia 🇨🇿", "Nadie (0-0)"],
  },
  {
    id: "q2",
    label: "¿Habrá gol en el segundo tiempo?",
    type: "radio",
    options: ["Sí", "No"],
  },
  {
    id: "q3",
    label: "¿En qué minuto cae el primer gol?",
    type: "text",
    placeholder: 'Ej: 23 o escribe "no hay gol"',
  },
  {
    id: "q4",
    label: "¿El partido termina 0-0?",
    type: "radio",
    options: ["Sí", "No"],
  },
  {
    id: "q5",
    label: "¿Habrá tarjeta en el partido?",
    type: "radio",
    options: ["Sí", "No"],
  },
  {
    id: "q6",
    label: "¿Cuántas tarjetas habrá en total?",
    type: "radio",
    options: ["0", "1", "2", "3+"],
  },
  {
    id: "q7",
    label: "¿Qué equipo se ve más probable que gane?",
    type: "radio",
    options: ["México 🇲🇽", "Chequia 🇨🇿", "Empate"],
  },
  {
    id: "q8",
    label: "¿Habrá VAR en el partido?",
    type: "radio",
    options: ["Sí", "No"],
  },
  {
    id: "q9",
    label: "¿Resultado final? (marcador exacto)",
    type: "text",
    placeholder: "Ej: México 2 - 1 Chequia",
  },
  {
    id: "q10",
    label: "¿Habrá gol después del minuto 75?",
    type: "radio",
    options: ["Sí", "No"],
  },
];

const STORAGE_KEY = "quiniela-mexico-chequia-2026";

function AdminView({ onBack }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await window.storage.get(STORAGE_KEY, true);
        if (result) {
          setEntries(JSON.parse(result.value));
        }
      } catch {
        setEntries([]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleDelete = async (idx) => {
    const updated = entries.filter((_, i) => i !== idx);
    await window.storage.set(STORAGE_KEY, JSON.stringify(updated), true);
    setEntries(updated);
  };

  if (loading) return <div style={styles.center}><span style={styles.spinner}>⚽</span> Cargando...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.adminHeader}>
        <button style={styles.backBtn} onClick={onBack}>← Volver</button>
        <h2 style={styles.adminTitle}>📋 Resultados de la Quiniela</h2>
        <span style={styles.badge}>{entries.length} {entries.length === 1 ? "participante" : "participantes"}</span>
      </div>

      {entries.length === 0 ? (
        <div style={styles.empty}>Aún no hay respuestas registradas.</div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Nombre</th>
                {QUESTIONS.map((q, i) => (
                  <th key={q.id} style={styles.th}>P{i + 1}</th>
                ))}
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr key={idx} style={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  <td style={styles.td}>{idx + 1}</td>
                  <td style={{ ...styles.td, fontWeight: 700, color: "#006847" }}>{entry.name}</td>
                  {QUESTIONS.map((q) => (
                    <td key={q.id} style={styles.td}>{entry.answers[q.id] || "—"}</td>
                  ))}
                  <td style={styles.td}>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(idx)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={styles.legend}>
        {QUESTIONS.map((q, i) => (
          <div key={q.id} style={styles.legendItem}>
            <strong>P{i + 1}:</strong> {q.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Quiniela() {
  const [view, setView] = useState("form"); // "form" | "admin" | "thanks"
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [adminClicks, setAdminClicks] = useState(0);

  const setAnswer = (id, val) => setAnswers((prev) => ({ ...prev, [id]: val }));

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Por favor escribe tu nombre."); return; }
    for (const q of QUESTIONS) {
      if (!answers[q.id] || !answers[q.id].trim()) {
        setError(`Falta responder: "${q.label}"`);
        return;
      }
    }
    setError("");
    setSubmitting(true);
    try {
      let existing = [];
      try {
        const res = await window.storage.get(STORAGE_KEY, true);
        if (res) existing = JSON.parse(res.value);
      } catch {}
      existing.push({ name: name.trim(), answers, timestamp: new Date().toISOString() });
      await window.storage.set(STORAGE_KEY, JSON.stringify(existing), true);
      setView("thanks");
    } catch {
      setError("Hubo un problema al guardar. Intenta de nuevo.");
    }
    setSubmitting(false);
  };

  const handleTitleClick = () => {
    setAdminClicks((n) => {
      const next = n + 1;
      if (next >= 5) { setView("admin"); return 0; }
      return next;
    });
  };

  if (view === "admin") return <AdminView onBack={() => setView("form")} />;

  if (view === "thanks") return (
    <div style={styles.page}>
      <div style={styles.thanksCard}>
        <div style={styles.trophy}>🏆</div>
        <h2 style={styles.thanksTitle}>¡Quiniela enviada!</h2>
        <p style={styles.thanksText}>Tus respuestas fueron registradas, <strong>{name}</strong>.<br />¡Buena suerte y a disfrutar el partido!</p>
        <div style={styles.flags}>🇲🇽 <span style={{ fontSize: 28 }}>⚽</span> 🇨🇿</div>
        <button style={styles.replayBtn} onClick={() => { setView("form"); setName(""); setAnswers({}); }}>Hacer otra quiniela</button>
      </div>
    </div>
  );

  const answered = QUESTIONS.filter(q => answers[q.id]?.trim()).length;
  const progress = Math.round((answered / QUESTIONS.length) * 100);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop} onClick={handleTitleClick}>
          <span style={styles.flags2}>🇲🇽 🆚 🇨🇿</span>
          <h1 style={styles.title}>Quiniela</h1>
          <p style={styles.subtitle}>México vs Chequia</p>
        </div>
        <div style={styles.progressWrap}>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
          <span style={styles.progressLabel}>{answered}/{QUESTIONS.length} respondidas</span>
        </div>
      </div>

      <div style={styles.card}>
        {/* Name */}
        <div style={styles.nameWrap}>
          <label style={styles.nameLabel}>👤 Tu nombre</label>
          <input
            style={styles.nameInput}
            placeholder="Escribe tu nombre..."
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        {/* Questions */}
        {QUESTIONS.map((q, idx) => (
          <div key={q.id} style={styles.question}>
            <div style={styles.qHeader}>
              <span style={styles.qNum}>{idx + 1}</span>
              <p style={styles.qLabel}>{q.label}</p>
            </div>
            {q.type === "radio" && (
              <div style={styles.options}>
                {q.options.map(opt => {
                  const selected = answers[q.id] === opt;
                  return (
                    <button
                      key={opt}
                      style={selected ? styles.optSelected : styles.opt}
                      onClick={() => setAnswer(q.id, opt)}
                    >
                      {selected && <span style={styles.check}>✓ </span>}
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
            {q.type === "text" && (
              <input
                style={styles.textInput}
                placeholder={q.placeholder}
                value={answers[q.id] || ""}
                onChange={e => setAnswer(q.id, e.target.value)}
              />
            )}
          </div>
        ))}

        {error && <div style={styles.error}>⚠️ {error}</div>}

        <button
          style={submitting ? styles.submitDisabled : styles.submit}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Guardando..." : "⚽ Enviar mi quiniela"}
        </button>
        <p style={styles.hint}>Tus respuestas se comparten con el organizador del partido.</p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(160deg, #005229 0%, #00723a 50%, #1a3a00 100%)", padding: "16px", fontFamily: "'Segoe UI', system-ui, sans-serif" },
  header: { maxWidth: 600, margin: "0 auto 16px", textAlign: "center" },
  headerTop: { cursor: "pointer", userSelect: "none" },
  flags2: { fontSize: 36, display: "block", marginBottom: 4 },
  title: { margin: 0, fontSize: 36, fontWeight: 900, color: "#fff", letterSpacing: "-1px", textShadow: "0 2px 8px rgba(0,0,0,0.3)" },
  subtitle: { margin: "4px 0 12px", color: "#a8e6c4", fontSize: 15, fontWeight: 600 },
  progressWrap: { display: "flex", alignItems: "center", gap: 10 },
  progressBar: { flex: 1, height: 8, background: "rgba(255,255,255,0.2)", borderRadius: 99, overflow: "hidden" },
  progressFill: { height: "100%", background: "#ffd700", borderRadius: 99, transition: "width 0.4s ease" },
  progressLabel: { color: "#a8e6c4", fontSize: 12, whiteSpace: "nowrap", fontWeight: 600 },
  card: { maxWidth: 600, margin: "0 auto", background: "#fff", borderRadius: 20, padding: "24px 20px", boxShadow: "0 8px 40px rgba(0,0,0,0.3)" },
  nameWrap: { marginBottom: 20 },
  nameLabel: { display: "block", fontWeight: 700, fontSize: 14, color: "#333", marginBottom: 6 },
  nameInput: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "2px solid #e0e0e0", fontSize: 16, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" },
  question: { marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #f0f0f0" },
  qHeader: { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  qNum: { background: "#006847", color: "#fff", borderRadius: 50, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 },
  qLabel: { margin: 0, fontSize: 15, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.4 },
  options: { display: "flex", flexWrap: "wrap", gap: 8 },
  opt: { padding: "9px 16px", borderRadius: 50, border: "2px solid #e0e0e0", background: "#f8f8f8", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#444", transition: "all 0.15s" },
  optSelected: { padding: "9px 16px", borderRadius: 50, border: "2px solid #006847", background: "#006847", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#fff", transition: "all 0.15s" },
  check: { fontWeight: 900 },
  textInput: { width: "100%", padding: "11px 14px", borderRadius: 10, border: "2px solid #e0e0e0", fontSize: 15, outline: "none", boxSizing: "border-box" },
  error: { background: "#fff3cd", color: "#856404", border: "1px solid #ffc107", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 14, fontWeight: 600 },
  submit: { width: "100%", padding: "15px", background: "linear-gradient(135deg, #006847, #00a86b)", color: "#fff", border: "none", borderRadius: 12, fontSize: 17, fontWeight: 800, cursor: "pointer", letterSpacing: 0.5, boxShadow: "0 4px 16px rgba(0,104,71,0.4)" },
  submitDisabled: { width: "100%", padding: "15px", background: "#ccc", color: "#fff", border: "none", borderRadius: 12, fontSize: 17, fontWeight: 800, cursor: "not-allowed" },
  hint: { textAlign: "center", color: "#999", fontSize: 12, marginTop: 10, marginBottom: 0 },
  // Thanks
  thanksCard: { maxWidth: 420, margin: "60px auto 0", background: "#fff", borderRadius: 24, padding: 36, textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,0.3)" },
  trophy: { fontSize: 64, marginBottom: 8 },
  thanksTitle: { margin: "0 0 10px", fontSize: 28, fontWeight: 900, color: "#006847" },
  thanksText: { color: "#555", fontSize: 16, lineHeight: 1.6, margin: "0 0 20px" },
  flags: { fontSize: 40, marginBottom: 20, display: "flex", justifyContent: "center", alignItems: "center", gap: 12 },
  replayBtn: { padding: "12px 28px", background: "#006847", color: "#fff", border: "none", borderRadius: 50, fontSize: 15, fontWeight: 700, cursor: "pointer" },
  // Admin
  adminHeader: { maxWidth: 900, margin: "0 auto 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  adminTitle: { margin: 0, color: "#fff", fontSize: 22, fontWeight: 800, flex: 1 },
  badge: { background: "#ffd700", color: "#333", borderRadius: 50, padding: "4px 14px", fontWeight: 800, fontSize: 14 },
  backBtn: { background: "rgba(255,255,255,0.15)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 700 },
  tableWrap: { maxWidth: 900, margin: "0 auto 20px", overflowX: "auto", background: "#fff", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { background: "#006847", color: "#fff", padding: "10px 12px", textAlign: "left", fontWeight: 700, whiteSpace: "nowrap" },
  td: { padding: "10px 12px", borderBottom: "1px solid #f0f0f0", verticalAlign: "top" },
  rowEven: { background: "#fff" },
  rowOdd: { background: "#f9f9f9" },
  deleteBtn: { background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontWeight: 700 },
  legend: { maxWidth: 900, margin: "0 auto", background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "16px 20px" },
  legendItem: { color: "#c8f0dc", fontSize: 13, marginBottom: 4 },
  empty: { maxWidth: 900, margin: "0 auto", color: "#a8e6c4", textAlign: "center", padding: 40, fontSize: 16 },
  center: { color: "#fff", textAlign: "center", padding: 60, fontSize: 18 },
  spinner: { fontSize: 40, display: "inline-block", animation: "spin 1s linear infinite" },
};
