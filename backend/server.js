const express = require("express");
const app = express();
const cors = require("cors");
const Database = require("better-sqlite3");

const db = new Database("reminders.db");

// Create table if it doesn't exist
db.exec(`
    CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        nextTriggerAt TEXT NOT NULL,
        repeatType TEXT NOT NULL
    )
`);

app.use(cors());
app.use(express.json());

app.get("/reminders", (req, res) => {
    const reminders = db.prepare("SELECT * FROM reminders").all();
    res.json(reminders);
});

app.post("/reminders", (req, res) => {
    const { title, nextTriggerAt, repeatType } = req.body;

    console.log("Incoming reminder:", { title, nextTriggerAt, repeatType }); 

    const stmt = db.prepare("INSERT INTO reminders (id, title, nextTriggerAt, repeatType) VALUES (?, ?, ?, ?)");
    const id = Date.now();
    stmt.run(id, title, nextTriggerAt, repeatType);
    res.status(201).json({ id, title, nextTriggerAt, repeatType });

});

app.patch("/reminders/:id", (req, res) => {
    const id = Number(req.params.id);
    const reminder = db.prepare("SELECT * FROM reminders WHERE id = ?").get(id);

     console.log("Incoming update for ID:", id, "with data:", req.body); // add this

    if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
    }

    const updatedTitle = req.body.title !== undefined ? req.body.title : reminder.title;
    const updatedNextTriggerAt = req.body.nextTriggerAt !== undefined ? req.body.nextTriggerAt : reminder.nextTriggerAt;
    const updatedRepeatType = req.body.repeatType !== undefined ? req.body.repeatType : reminder.repeatType;

    db.prepare("UPDATE reminders SET title = ?, nextTriggerAt = ?, repeatType = ? WHERE id = ?")
      .run(updatedTitle, updatedNextTriggerAt, updatedRepeatType, id);

    res.json({ id, title: updatedTitle, nextTriggerAt: updatedNextTriggerAt, repeatType: updatedRepeatType });
});

app.delete("/reminders/:id", (req, res) => {
    const id = Number(req.params.id);
    const title = db.prepare("SELECT title FROM reminders WHERE id = ?").get(id)?.title || "Unknown";

    console.log("Deleting Reminder:", title);

    const result = db.prepare("DELETE FROM reminders WHERE id = ?").run(id);

    if (result.changes === 0) {
        return res.status(404).json({ message: "Reminder not found" });
    }

    res.json({ message: "Reminder deleted" });
});

setInterval(() => {
    const now = new Date();
    const reminders = db.prepare("SELECT * FROM reminders").all();

    reminders.forEach((reminder) => {
        const triggerTime = new Date(reminder.nextTriggerAt);

        if (triggerTime <= now) {
            console.log("Reminder triggered:", reminder.title);

            if (reminder.repeatType === "once") {
                db.prepare("DELETE FROM reminders WHERE id = ?").run(reminder.id);
            } else if (reminder.repeatType === "daily") {
                const next = new Date(reminder.nextTriggerAt);
                next.setDate(next.getDate() + 1);
                db.prepare("UPDATE reminders SET nextTriggerAt = ? WHERE id = ?")
                  .run(next.toISOString(), reminder.id);
            } else if (reminder.repeatType === "weekly") {
                const next = new Date(reminder.nextTriggerAt);
                next.setDate(next.getDate() + 7);
                db.prepare("UPDATE reminders SET nextTriggerAt = ? WHERE id = ?")
                  .run(next.toISOString(), reminder.id);
            }
        }
    });
}, 60000);

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});