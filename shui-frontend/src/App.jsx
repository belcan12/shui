
import { useEffect, useState } from "react";
import { fetchMessages, createMessage, updateMessage } from "./api";

import "./index.css";
import "./App.css";

function formatDate(ts) {
  try {
    return new Date(ts).toLocaleString("sv-SE", {
      dateStyle: "full",
      timeStyle: "short",
    });
  } catch {
    return String(ts);
  }
}

function LogoBadge({ small = false, onClick }) {
  return (
    <button
      className={`logo-badge ${small ? "small" : ""} logo-btn`}
      type="button"
      title="Till startsidan"
      onClick={onClick}
    >
      <span>S</span>
    </button>
  );
}

export default function App() {
  const [view, setView] = useState("list"); // 'list' | 'new' | 'edit'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [messages, setMessages] = useState([]);
  const [sort, setSort] = useState("desc");
  const [filterUser, setFilterUser] = useState("");

  const [newUser, setNewUser] = useState("");
  const [newText, setNewText] = useState("");

  const [editId, setEditId] = useState("");
  const [editText, setEditText] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMessages({ username: filterUser.trim(), sort });
      setMessages(data.items || []);
    } catch (e) {
      setError(e.message || "Något gick fel");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  const onFilter = async (e) => {
    e.preventDefault();
    await load();
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createMessage({ username: newUser, text: newText });
      setNewUser("");
      setNewText("");
      setView("list");
      await load();
    } catch (e) {
      setError(e.message || "Kunde inte skapa meddelande");
    }
  };

  const startEdit = (m) => {
    setEditId(m.id);
    setEditText(m.text);
    setView("edit");
  };

  const onUpdate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await updateMessage(editId, { text: editText });
      setView("list");
      await load();
    } catch (e) {
      setError(e.message || "Kunde inte uppdatera meddelande");
    }
  };

  return (
    <div className="page">
      {/* Topbar */}
      <header className="topbar">
        <LogoBadge onClick={() => setView("list")} />
        <h1>Shui – Anslagstavla</h1>
        <nav className="nav">
          <button
            className={`tab ${view === "list" ? "active" : ""}`}
            onClick={() => setView("list")}
          >
            Lista
          </button>
          <button
            className={`tab ${view === "new" ? "active" : ""}`}
            onClick={() => setView("new")}
          >
            Nytt meddelande
          </button>
          {view === "edit" && (
            <button className="tab active" onClick={() => setView("edit")}>
              Redigera
            </button>
          )}
        </nav>
      </header>

      {/* Felruta */}
      {error && <div className="alert">{error}</div>}

      {/* LIST VIEW */}
      {view === "list" && (
        <section className="content two-col">
          <div className="col col--list">
            <form onSubmit={onFilter} className="panel" style={{ marginBottom: 12 }}>
              <h3>Filtrera</h3>

              <label className="field">
                <span className="label-white">Användarnamn</span>
                <input
                  className="input input--light"
                  placeholder="t.ex. Anna"
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                />
              </label>

              <label className="field">
                <span className="label-white">Sortering</span>
                <select
                  className="input input--light"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="desc">Nyast först</option>
                  <option value="asc">Äldst först</option>
                </select>
              </label>

              <button type="submit" className="btn-primary full">
                Hämta
              </button>
            </form>

            {loading ? (
              <p className="muted">Laddar…</p>
            ) : messages.length === 0 ? (
              <div className="empty">
                <p className="empty-text">
                  Du har inga meddelanden
                  <br />
                  att visa.
                </p>
                <div className="wave" />
              </div>
            ) : (
              <ul className="cards">
                {messages.map((m) => (
                  <li key={m.id} className="card">
                    <div className="meta">
                      <span className="date-black">{formatDate(m.createdAt)}</span>
                    </div>

                    <div className="bubble">
                      <p className="text">{m.text}</p>
                      <div className="tail" />
                    </div>

                    <div className="author">— {m.username}</div>

                    <button
                      className="edit-btn"
                      title="Redigera"
                      onClick={() => startEdit(m)}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="col col--filter" />
        </section>
      )}

      {/* Flytande penna i list-vyn */}
      {view === "list" && (
        <button
          className="compose-fab"
          title="Nytt meddelande"
          onClick={() => setView("new")}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              fill="currentColor"
              d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
            />
          </svg>
        </button>
      )}

      {/* NEW VIEW */}
      {view === "new" && (
        <section className="content one-col">
          <div className="composer panel">
            <form onSubmit={onCreate} className="composer-form">
              <textarea
                className="input text-area"
                placeholder="Skriv ditt meddelande här"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                rows={6}
                required
              />

              <label className="field">
                <span className="label-white">Användarnamn</span>
                <input
                  className="input input--light"
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                  required
                />
              </label>

              <button type="submit" className="btn-primary full">
                Publicera
              </button>
            </form>
          </div>
        </section>
      )}

      {/* EDIT VIEW */}
      {view === "edit" && (
        <section className="content one-col">
          {!editId ? (
            <p className="muted">Välj först ett meddelande i listan.</p>
          ) : (
            <div className="composer panel">
              <div className="tiny muted">ID: {editId}</div>

              <form onSubmit={onUpdate} className="composer-form">
                <label className="field">
                  <span className="label-white">Ny text</span>
                  <textarea
                    className="input text-area"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={6}
                    required
                  />
                </label>

                <div className="row">
                  <button type="submit" className="btn-primary">
                    Uppdatera
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setView("list")}
                  >
                    Avbryt
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
