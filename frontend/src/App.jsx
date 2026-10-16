import { useEffect, useRef, useState } from "react";

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
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isSavingStudent, setIsSavingStudent] = useState(false);
  const [formError, setFormError] = useState("");
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isAddStudentOpen) {
      dialogRef.current?.showModal();
    }
  }, [isAddStudentOpen]);

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

  async function addStudent(event) {
    event.preventDefault();
    setIsSavingStudent(true);
    setFormError("");

    const formData = new FormData(event.currentTarget);
    const student = {
      name: formData.get("name"),
      grade: formData.get("grade"),
      department: formData.get("department"),
    };

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Unable to add student (HTTP ${response.status}).`);
      }

      dialogRef.current?.close();
      setIsAddStudentOpen(false);
      await getDirectory("students");
    } catch (requestError) {
      setFormError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to add student. Please try again.",
      );
    } finally {
      setIsSavingStudent(false);
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
          <button
            className="directory-button"
            type="button"
            onClick={() => {
              setFormError("");
              setIsAddStudentOpen(true);
            }}
          >
            <span aria-hidden="true">+</span>
            Add student
          </button>
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

        {isAddStudentOpen && (
          <dialog
            className="student-dialog"
            ref={dialogRef}
            aria-labelledby="student-dialog-title"
            onClose={() => setIsAddStudentOpen(false)}
          >
            <form className="student-form" onSubmit={addStudent}>
              <p className="eyebrow">STUDENT DETAILS</p>
              <h2 id="student-dialog-title">Add a student</h2>
              <label>
                Name
                <input name="name" type="text" autoComplete="name" required />
              </label>
              <label>
                Grade
                <input name="grade" type="text" required />
              </label>
              <label>
                Department <span className="optional-label">(optional)</span>
                <input name="department" type="text" />
              </label>
              {formError && (
                <p className="form-error" role="alert">{formError}</p>
              )}
              <div className="form-actions">
                <button
                  className="cancel-button"
                  type="button"
                  onClick={() => dialogRef.current?.close()}
                  disabled={isSavingStudent}
                >
                  Cancel
                </button>
                <button
                  className="directory-button"
                  type="submit"
                  disabled={isSavingStudent}
                >
                  {isSavingStudent ? "Saving..." : "Save student"}
                </button>
              </div>
            </form>
          </dialog>
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
