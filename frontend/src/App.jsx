import { useState } from "react";

export default function App() {
  const [students, setStudents] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function getStudents() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/students");
      if (!response.ok) {
        throw new Error(`Unable to load students (HTTP ${response.status}).`);
      }

      const data = await response.json();
      if (!Array.isArray(data.students)) {
        throw new Error("The server returned an invalid student list.");
      }

      setStudents(data.students);
      setHasLoaded(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load students. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Campus home">
          <span className="brand-mark" aria-hidden="true">C</span>
          <span>Campus</span>
        </a>
        <span className="topbar-note">STUDENT SERVICES</span>
      </header>

      <section className="content">
        <p className="eyebrow">DIRECTORY</p>
        <h1>Students, at a glance.</h1>
        <p className="intro">
          Browse the student directory and find the details you need.
        </p>

        <button
          className="students-button"
          type="button"
          onClick={getStudents}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Loading students
            </>
          ) : (
            <>
              <span aria-hidden="true">⌕</span>
              Students
            </>
          )}
        </button>

        {error && (
          <div className="message error-message" role="alert">
            <span>{error}</span>
            <button className="retry-button" type="button" onClick={getStudents}>
              Try again
            </button>
          </div>
        )}

        {hasLoaded && !error && (
          <section className="directory" aria-live="polite">
            <div className="directory-heading">
              <div>
                <p className="eyebrow">STUDENT DIRECTORY</p>
                <h2>All students</h2>
              </div>
              <span className="count-badge">
                {students.length} {students.length === 1 ? "student" : "students"}
              </span>
            </div>

            {students.length > 0 ? (
              <div className="student-list">
                {students.map((student) => (
                  <article className="student-card" key={student.id}>
                    <div className="student-avatar" aria-hidden="true">
                      {student.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="student-info">
                      <h3>{student.name}</h3>
                      <p>Student ID · {student.id}</p>
                    </div>
                    <span className="grade-badge">Grade {student.grade}</span>
                  </article>
                ))}
              </div>
            ) : (
              <p className="message empty-message">No students to display yet.</p>
            )}
          </section>
        )}
      </section>

      <footer className="footer">A welcoming place to learn and grow.</footer>
    </main>
  );
}
