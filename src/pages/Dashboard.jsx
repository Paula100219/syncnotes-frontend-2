// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../services/api";
import "./dashboard.css";

const BRAND_NAME = "SyncNotes";

export default function Dashboard() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null); // { user, rooms, tasks, message }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getMe(); // requiere token válido
        if (alive) setMe(data);
      } catch (e) {
        console.error("getMe error:", e);
        // Si el token ya no sirve, vuelve al login
        navigate("/login", { replace: true });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [navigate]);

  const rooms = me?.rooms || [];
  const tasks = me?.tasks || [];

  return (
    <div className="db-root" translate="no">
      {/* TOP NAV */}
      <header className="db-topbar" translate="no" aria-label="Barra de navegación">
        <div className="db-brand" translate="no" onClick={() => navigate("/dashboard")} role="button" tabIndex={0}>
          <div className="db-logo" aria-hidden>📝</div>
          <span className="db-brand-text">{BRAND_NAME}</span>
        </div>

        <div className="db-actions" translate="no">
          <button className="db-btn db-btn-primary" type="button" aria-label="Crear nueva sala">
            <span className="db-btn-icon">＋</span>
            <span>Crear nueva sala</span>
          </button>

          <button className="db-btn db-btn-ghost" type="button" aria-label="Ver salas públicas">
            Ver salas públicas
          </button>

          <div className="db-avatar" aria-label="Menú de usuario" title="Cuenta">
            <img
              src="https://i.pravatar.cc/32"
              alt="avatar"
              width="32"
              height="32"
            />
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="db-main" translate="no">
        <h1 className="db-title" translate="no">Tu Espacio de Trabajo</h1>

        <div className="db-grid">
          {/* IZQUIERDA: SALAS */}
          <section className="db-left" aria-label="Mis salas" translate="no">
            <h2 className="db-section-title" translate="no">Mis Salas</h2>

            <div className="db-rooms-grid">
              {loading ? (
                <div className="db-card db-skeleton" aria-busy="true" />
              ) : rooms.length > 0 ? (
                rooms.map((r) => (
                  <article className="db-card db-room" key={r.id}>
                    <div className="db-room-header">
                      <h3 className="db-room-title">{r.name}</h3>
                      {/* Si tienes un indicador de miembros activos, colócalo aquí */}
                    </div>
                    <p className="db-room-sub">{
                      (r.members?.length ?? 0) + " miembros"
                    }</p>

                    <button
                      className="db-btn db-btn-blue"
                      type="button"
                      onClick={() => {
                        // Navegación a la sala (si existe ruta)
                        // navigate(`/rooms/${r.id}`);
                        console.log("Abrir sala:", r.id);
                      }}
                    >
                      Abrir sala
                    </button>
                  </article>
                ))
              ) : (
                <article className="db-card db-empty-card">
                  <div className="db-empty-icon" aria-hidden>👥</div>
                  <p className="db-empty-title">Aún no tienes salas.</p>
                  <p className="db-empty-sub">¡Crea una para empezar a colaborar!</p>
                </article>
              )}
            </div>
          </section>

          {/* DERECHA: TAREAS PENDIENTES */}
          <aside className="db-right" aria-label="Tus tareas pendientes" translate="no">
            <h2 className="db-section-title" translate="no">Tus Tareas Pendientes</h2>

            <div className="db-card db-tasks-panel">
              {loading ? (
                <ul className="db-tasks-list">
                  <li className="db-task db-skeleton" aria-busy="true" />
                  <li className="db-task db-skeleton" aria-busy="true" />
                </ul>
              ) : tasks.length > 0 ? (
                <ul className="db-tasks-list">
                  {tasks.map((t) => (
                    <li key={t.id} className={"db-task" + (t.completed ? " is-done" : "")}>
                      <label className="db-task-row">
                        <input
                          type="checkbox"
                          checked={!!t.completed}
                          onChange={() => {
                            // Aquí podrías alternar estado con API
                            console.log("toggle task", t.id);
                          }}
                          aria-label="Completar tarea"
                        />
                        <span className="db-task-title">{t.title}</span>
                        <span className={
                          "db-badge " +
                          (t.completed
                            ? "db-badge-green"
                            : t.dueTag === "today"
                            ? "db-badge-red"
                            : t.dueTag === "tomorrow"
                            ? "db-badge-yellow"
                            : "")
                        }>
                          {t.completed
                            ? "Completada"
                            : t.dueTag === "today"
                            ? "Vence hoy"
                            : t.dueTag === "tomorrow"
                            ? "Vence mañana"
                            : ""}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="db-empty-tasks" role="status" aria-live="polite">
                  No tienes tareas pendientes 🎉
                </div>
              )}

              <button className="db-btn db-btn-ghost db-btn-block" type="button" aria-label="Nueva tarea">
                <span className="db-btn-icon">＋</span> Nueva tarea
              </button>
            </div>
          </aside>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="db-footer" translate="no">
        <div>© 2024 {BRAND_NAME}. Todos los derechos reservados.</div>
        <nav className="db-footer-links" aria-label="Enlaces del pie de página">
          <a href="#" className="db-footer-link">Ayuda</a>
          <a href="#" className="db-footer-link">Contacto</a>
          <a href="#" className="db-footer-link">Términos de servicio</a>
        </nav>
      </footer>
    </div>
  );
}