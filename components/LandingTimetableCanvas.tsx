const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const hours = ["07.00", "09.00", "11.00", "13.00", "15.00", "17.00", "19.00"];

const sessions = [
  { id: "raka", time: "08.00 - 09.30", name: "Raka", subject: "Matematika", tone: "mint" },
  { id: "nala", time: "15.00 - 16.00", name: "Nala", subject: "Matematika", tone: "coral" },
  { id: "dimas", time: "18.30 - 20.00", name: "Dimas", subject: "Fisika", tone: "lilac" },
] as const;

const cells = Array.from({ length: days.length * hours.length }, (_, index) => index);

export default function LandingTimetableCanvas() {
  return (
    <div className="tl-hero-schedule" aria-hidden="true">
      <div className="tl-hero-schedule-days">
        {days.map((day) => (
          <span className="tl-hero-schedule-day" data-current-day={day === "Jum" || undefined} key={day}>{day}</span>
        ))}
      </div>
      <div className="tl-hero-schedule-hours">
        {hours.map((hour) => <span className="tl-hero-schedule-hour" key={hour}>{hour}</span>)}
      </div>
      <div className="tl-hero-schedule-grid">
        {cells.map((cell) => <span className="tl-hero-schedule-cell" key={cell} />)}
        {sessions.map((session) => (
          <div className={`tl-hero-schedule-block tl-hero-schedule-block-${session.tone} tl-hero-schedule-block-${session.id}`} data-schedule-session={session.id} key={session.id}>
            <span>{session.time}</span>
            <strong>{session.name}</strong>
            <small>{session.subject}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
