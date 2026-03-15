import { useEffect, useState } from "react";

function App() {
  const [reminders, setReminders] = useState([]);
  const [title, setTitle] = useState("");
  const [nextTriggerAt, setNextTriggerAt] = useState("");
  const [repeatType, setRepeatType] = useState("once");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNextTriggerAt, setEditNextTriggerAt] = useState("");
  const [editRepeatType, setEditRepeatType] = useState("once");

  useEffect(() => {
    fetch("http://localhost:5000/reminders")
      .then((res) => res.json())
      .then((data) => setReminders(data));
  }, []);

  function createReminder() {
    fetch("http://localhost:5000/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        nextTriggerAt: new Date(nextTriggerAt).toISOString(),
        repeatType,
      }),
    })
      .then((res) => res.json())
      .then((newReminder) => {
        setReminders([...reminders, newReminder]);
        setTitle("");
        setNextTriggerAt("");
        setRepeatType("once");
      });
  }

  function deleteReminder(id) {
    fetch(`http://localhost:5000/reminders/${id}`, {
      method: "DELETE",
    }).then(() => {
      setReminders(reminders.filter((reminder) => reminder.id !== id));
    });
  }

  function startEditing(reminder) {
    setEditingId(reminder.id);
    setEditTitle(reminder.title);
    setEditNextTriggerAt(reminder.nextTriggerAt);
    setEditRepeatType(reminder.repeatType);
  }

  function saveEdit(id) {
    fetch(`http://localhost:5000/reminders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        nextTriggerAt: new Date(editNextTriggerAt).toISOString(),
        repeatType: editRepeatType,
      }),
    })
      .then((res) => res.json())
      .then((updatedReminder) => {
        setReminders(reminders.map((r) => (r.id === id ? updatedReminder : r)));
        setEditingId(null);
      });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  return (
    <div>
      <h1>Reminders</h1>

      <div>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="datetime-local"
          value={nextTriggerAt}
          onChange={(e) => setNextTriggerAt(e.target.value)}
        />
        <select value={repeatType} onChange={(e) => setRepeatType(e.target.value)}>
          <option value="once">Once</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
        <button onClick={createReminder}>Add Reminder</button>
      </div>

      <ul>
        {reminders.map((reminder) => (
          <li key={reminder.id}>
            {editingId === reminder.id ? (
              <div>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <input
                  type="datetime-local"
                  value={editNextTriggerAt}
                  onChange={(e) => setEditNextTriggerAt(e.target.value)}
                />
                <select
                  value={editRepeatType}
                  onChange={(e) => setEditRepeatType(e.target.value)}
                >
                  <option value="once">Once</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
                <button onClick={() => saveEdit(reminder.id)}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </div>
            ) : (
              <div>
                {reminder.title} — {reminder.nextTriggerAt} — {reminder.repeatType}
                <button onClick={() => startEditing(reminder)}>Edit</button>
                <button onClick={() => deleteReminder(reminder.id)}>Delete</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;