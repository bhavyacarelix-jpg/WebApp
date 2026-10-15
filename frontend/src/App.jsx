import { useState } from "react";

const directoryTypes = {
  students: {
    label: "Students",
    singularLabel: "Student",
    detailLabel: "Grade",
    detailKey: "grade",
  },
  teachers: {
    label: "Teachers",
    singularLabel: "Teacher",
    detailLabel: "Subject",
    detailKey: "subject",
  },
  staff: {
    label: "Staff",
    singularLabel: "Staff member",
    detailLabel: "Role",
    detailKey: "role",
  },
};

export default function App() {
  const [directory, setDirectory] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [loadingType, setLoadingType] = useState(null);
  const [error, setError] = useState("");

  async function getDirectory(type) {
    setSelectedType(type);
    setLoadingType(type);
    setError("");
    setDirectory(null);

    try {
      const response = await fetch(`/api/${type}`);
      if (!response.ok) {
        throw new Error(
          `Unable to load ${directoryTypes[type].label.toLowerCase()} (HTTP ${response.status}).`,
        );
      }

      const data = await response.json();
      if (!Array.isArray(data[type])) {
        throw new Error(`The server returned an invalid ${type} list.`);
      }

      setDirectory({ type, people: data[type] });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : `Unable to load ${directoryTypes[type].label.toLowerCase()}. Please try again.`,
      );
    } finally {
      setLoadingType(null);
    }
  }

  const directoryConfig = directory
    ? directoryTypes[directory.type]
    : null;

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
        <h1>Your campus directory.</h1>
        <p className="intro">
          Browse student, teacher, and staff details from across your campus.
        </p>

        <div className="directory-actions" aria-label="Choose a directory">
          {Object.entries(directoryTypes).map(([type, config]) => (
            <button
              className="directory-button"
              type="button"
              key={type}
              onClick={() => getDirectory(type)}
              disabled={loadingType !== null}
            >
              {loadingType === type ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Loading {config.label.toLowerCase()}
                </>
              ) : (
                <>
                  <span aria-hidden="true">⌕</span>
                  {config.label}
                </>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="message error-message" role="alert">
            <span>{error}</span>
            <button
              className="retry-button"
              type="button"
              onClick={() => getDirectory(selectedType ?? "students")}
            >
              Try again
            </button>
          </div>
        )}

        {directory && directoryConfig && !error && (
          <section className="directory" aria-live="polite">
            <div className="directory-heading">
              <div>
                <p className="eyebrow">{directoryConfig.label.toUpperCase()} DIRECTORY</p>
                <h2>All {directory.type}</h2>
              </div>
              <span className="count-badge">
                {directory.people.length}{" "}
                {directory.people.length === 1
                  ? directoryConfig.singularLabel.toLowerCase()
                  : directoryConfig.label.toLowerCase()}
              </span>
            </div>

            {directory.people.length > 0 ? (
              <div className="student-list">
                {directory.people.map((person) => (
                  <article className="student-card" key={person.id}>
                    <div className="student-avatar" aria-hidden="true">
                      {person.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="student-info">
                      <h3>{person.name}</h3>
                      <p>{directoryConfig.singularLabel} ID · {person.id}</p>
                      {person.department && <p>Department · {person.department}</p>}
                    </div>
                    <span className="grade-badge">
                      {directoryConfig.detailLabel}{" "}
                      {person[directoryConfig.detailKey]}
                    </span>
                  </article>
                ))}
              </div>
            ) : (
              <p className="message empty-message">
                No {directory.type} to display yet.
              </p>
            )}
          </section>
        )}
      </section>

      <footer className="footer">A welcoming place to learn and grow.</footer>
    </main>
  );
}
