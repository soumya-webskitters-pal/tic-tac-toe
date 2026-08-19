import { useRef, useState } from "react";
const PRESETS = ["🧙", "🤖", "🦊", "🐼", "🐯", "👾", "🦸", "🥷"].map(
    (emoji, index) => ({
      id: `preset-${index}`,
      emoji,
      color: [
        "#8b5cf6",
        "#06b6d4",
        "#f97316",
        "#ec4899",
        "#eab308",
        "#22c55e",
        "#3b82f6",
        "#ef4444",
      ][index],
    })
  ),
  AGE_GROUPS = ["Under 13", "13–17", "18–24", "25–34", "35+"];
export const defaultAvatar = { type: "preset", value: PRESETS[0] };
export default function ProfileModal({ profile, history, onSave, onClose }) {
  const [name, setName] = useState(profile.name),
    [avatar, setAvatar] = useState(profile.avatar),
    [ageGroup, setAgeGroup] = useState(profile.ageGroup ?? 2),
    [dragging, setDragging] = useState(false),
    [error, setError] = useState(""),
    inputRef = useRef(null);
  const upload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 4 * 1024 * 1024) {
      setError("Choose an image smaller than 4 MB.");
      return;
    }
    const image = new Image(),
      reader = new FileReader();
    reader.onload = () => {
      image.onload = () => {
        const canvas = document.createElement("canvas"),
          side = Math.min(image.width, image.height);
        canvas.width = canvas.height = 256;
        canvas
          .getContext("2d")
          .drawImage(
            image,
            (image.width - side) / 2,
            (image.height - side) / 2,
            side,
            side,
            0,
            0,
            256,
            256
          );
        setAvatar({
          type: "custom",
          value: canvas.toDataURL("image/jpeg", 0.82),
        });
        setError("");
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  };
  const save = () => {
    const clean = name
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .trim()
      .slice(0, 18);
    if (!clean) {
      setError("Enter a gaming name.");
      return;
    }
    onSave({ name: clean, avatar, ageGroup });
    onClose();
  };
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className="modal-card profile-modal glass"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-sticky-header">
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
          <div className="modal-kicker">PLAYER PROFILE</div>
          <h2>Make it yours</h2>
          <p className="modal-copy">
            Your profile and battle record stay only on this device.
          </p>
          <div className="modal-separator" aria-hidden="true" />
        </div>
        <label className="profile-label">GAMING NAME</label>
        <input
          className="profile-name-input"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 18))}
        />
        <label className="profile-label">AGE GROUP</label>
        <div
          className={`age-selector ${dragging ? "dragging" : ""}`}
          style={{ "--age-progress": `${(ageGroup / 4) * 100}%` }}
        >
          <strong>{AGE_GROUPS[ageGroup]}</strong>
          <input
            type="range"
            min="0"
            max="4"
            value={ageGroup}
            onChange={(e) => setAgeGroup(Number(e.target.value))}
            onPointerDown={() => setDragging(true)}
            onPointerUp={() => setDragging(false)}
          />
          <div className="age-ticks">
            {AGE_GROUPS.map((g, i) => (
              <span key={g} className={i === ageGroup ? "active" : ""}>
                {g}
              </span>
            ))}
          </div>
        </div>
        <label className="profile-label">CHOOSE AN AVATAR</label>
        <div className="avatar-grid">
          {PRESETS.map((item) => (
            <button
              key={item.id}
              className={
                avatar.type === "preset" && avatar.value.id === item.id
                  ? "selected"
                  : ""
              }
              style={{ "--avatar-color": item.color }}
              onClick={() => setAvatar({ type: "preset", value: item })}
            >
              {item.emoji}
            </button>
          ))}
          <button
            className={`upload-avatar ${
              avatar.type === "custom" ? "selected" : ""
            }`}
            onClick={() => inputRef.current?.click()}
          >
            {avatar.type === "custom" ? (
              <img src={avatar.value} alt="Custom avatar" />
            ) : (
              "＋"
            )}
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={upload}
        />
        <button
          className="upload-label"
          onClick={() => inputRef.current?.click()}
        >
          UPLOAD YOUR OWN IMAGE
        </button>
        {error && <p className="profile-error">{error}</p>}
        <button className="result-primary" onClick={save}>
          SAVE PROFILE
        </button>
        <div className="game-history profile-history">
          <label>GAME HISTORY</label>
          <p className="history-caption">
            Your latest battles, results, and finish details.
          </p>
          {history.length ? (
            <div className="history-list">
              {history.map((item) => (
                <div className="history-item" key={item.id}>
                  <span className={`history-mark ${item.winner}`}>
                    {item.winner === "draw" ? "◇" : item.winner}
                  </span>
                  <p>
                    <strong>
                      {item.winner === "draw"
                        ? "Draw"
                        : `${item.winner === "X" ? item.x : item.o} won`}
                    </strong>
                    <small>
                      {item.mode === "online"
                        ? "Online"
                        : item.mode === "ai"
                        ? "VS AI"
                        : "Offline"}{" "}
                      ·{" "}
                      {item.reason === "quit"
                        ? "Opponent quit"
                        : item.reason === "disconnect"
                        ? "Connection lost"
                        : "Completed"}
                    </small>
                  </p>
                  <time>{item.playedAt}</time>
                </div>
              ))}
            </div>
          ) : (
            <p className="history-empty">Finished matches will appear here.</p>
          )}
        </div>
      </section>
    </div>
  );
}
