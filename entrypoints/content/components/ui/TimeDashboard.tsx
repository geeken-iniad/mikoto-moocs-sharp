import { type CSSProperties, useEffect, useState } from "react";
import { Clock as ClockIcon, Calendar, BookOpen } from "lucide-react";
import type { Schedule, DayOfWeek, Class } from "../../utils/types";
import { PERIODS, STORAGE_KEY, DAY_LABELS } from "../../../options/components/constants";

const styles: Record<string, CSSProperties> = {
  dashboardContainer: {
    backgroundColor: "#fafaf9",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    position: "relative",
    zIndex: 1,
  },
  mainCard: {
    width: "100%",
    maxWidth: "80rem",
    margin: "0 auto",
    backgroundColor: "#f5f5f4",
    padding: "3rem",
    borderRadius: "1rem",
    boxShadow:
      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    border: "1px solid #e5e7eb",
  },
  clock: {
    textAlign: "center",
    color: "#1f2937",
    marginBottom: "2rem",
  },
  clockDate: {
    fontSize: "1.5rem",
    fontWeight: 700,
  },
  clockTime: {
    fontSize: "3rem",
    fontWeight: 700,
    letterSpacing: "0.05em",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "2rem",
  },
  columnContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  gridHeader: {
    fontSize: "1.5rem",
    fontWeight: 700,
    textAlign: "center",
    color: "#4b5563",
    marginBottom: "0.5rem",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "2rem",
    borderRadius: "0.75rem",
    border: "1px solid #d1d5db",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    minHeight: "180px",
  },
  infoCardTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#374151",
  },
  infoCardPeriod: {
    fontSize: "1rem",
    color: "#6b7280",
    marginBottom: "0.5rem",
  },
  infoCardCountdown: {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: "1.75rem",
    color: "#4f46e5",
  },
  infoCardCountdownLabel: {
    fontWeight: 700,
  },
  infoCardCountdownTime: {
    marginLeft: "0.5rem",
  },
  subjectCardTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#1f2937",
  },
  subjectCardDetails: {
    fontSize: "1.125rem",
    color: "#4b5563",
  },
};

const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);
  return currentTime;
};

const useCountdown = (targetDate: Date) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const now = useCurrentTime();
  useEffect(() => {
    const difference = targetDate.getTime() - now.getTime();
    if (difference > 0) {
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      setTimeLeft({ hours, minutes, seconds });
    } else {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
    }
  }, [now, targetDate]);
  return timeLeft;
};

const Clock = ({ currentTime }: { currentTime: Date }) => {
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
    return `${year}/${month}/${day}(${dayOfWeek})`;
  };
  return (
    <div style={styles.clock}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
        <Calendar size={20} />
        <p style={styles.clockDate}>{formatDate(currentTime)}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
        <ClockIcon size={24} />
        <p style={styles.clockTime}>{currentTime.toLocaleTimeString("ja-JP")}</p>
      </div>
    </div>
  );
};

const InfoCard = ({
  title,
  period,
  type,
  targetTime,
}: {
  title: string;
  period: string;
  type: "start" | "end";
  targetTime: Date;
}) => {
  const { hours, minutes, seconds } = useCountdown(targetTime);
  const label = type === "end" ? "終了まで" : "開始まで";
  return (
    <div style={styles.card}>
      <h3 style={styles.infoCardTitle}>{title}</h3>
      <p style={styles.infoCardPeriod}>{period}</p>
      <div style={styles.infoCardCountdown}>
        <span style={styles.infoCardCountdownLabel}>{label}:</span>
        <span style={styles.infoCardCountdownTime}>
          {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
          {String(seconds).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
};

const SubjectCard = ({
  subject,
  details,
}: {
  subject: string;
  details: string;
}) => (
  <div style={styles.card}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
      <BookOpen size={20} />
      <h3 style={styles.subjectCardTitle}>{subject}</h3>
    </div>
    <p style={styles.subjectCardDetails}>{details}</p>
  </div>
);

const getDayOfWeek = (date: Date): DayOfWeek | null => {
  const day = date.getDay();
  const dayMap: Record<number, DayOfWeek> = {
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday",
  };
  return dayMap[day] || null;
};

const findCurrentAndNextClass = (
  schedule: Schedule,
  currentTime: Date,
): { current: Class | null; next: Class | null; currentDay: DayOfWeek | null; nextDay: DayOfWeek | null } => {
  const today = getDayOfWeek(currentTime);

  if (!today) {
    return { current: null, next: null, currentDay: null, nextDay: null };
  }

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTimeString = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;

  const todayClasses = schedule[today] || [];

  let current: Class | null = null;
  let next: Class | null = null;
  let currentDay: DayOfWeek | null = null;
  let nextDay: DayOfWeek | null = null;

  // Find current class
  for (const cls of todayClasses) {
    if (currentTimeString >= cls.period.start && currentTimeString < cls.period.end) {
      current = cls;
      currentDay = today;
      break;
    }
  }

  // Find next class
  const allDays: DayOfWeek[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const todayIndex = allDays.indexOf(today);

  // First, look for next class today
  for (const cls of todayClasses) {
    if (currentTimeString < cls.period.start) {
      if (!next || cls.period.start < next.period.start) {
        next = cls;
        nextDay = today;
      }
    }
  }

  // If no next class today, look for first class in following days
  if (!next) {
    for (let i = 1; i <= 7; i++) {
      const dayIndex = (todayIndex + i) % allDays.length;
      const day = allDays[dayIndex];
      const classes = schedule[day] || [];

      if (classes.length > 0) {
        // Find earliest class for this day
        const sortedClasses = [...classes].sort((a, b) =>
          a.period.start.localeCompare(b.period.start)
        );
        next = sortedClasses[0];
        nextDay = day;
        break;
      }
    }
  }

  return { current, next, currentDay, nextDay };
};

const getPeriodLabel = (start: string, end: string): string => {
  const period = PERIODS.find(p => p.start === start && p.end === end);
  return period ? period.label : "";
};

export const TimeDashboard = () => {
  const currentTime = useCurrentTime();
  const [schedule, setSchedule] = useState<Schedule>({});

  useEffect(() => {
    const loadSchedule = async () => {
      const result = await storage.getItem<Schedule>(`local:${STORAGE_KEY}`);
      if (result) {
        setSchedule(result);
      }
    };
    loadSchedule();
  }, []);

  const { current, next, currentDay, nextDay } = findCurrentAndNextClass(schedule, currentTime);

  const getTargetTime = (cls: Class | null, isNext: boolean): Date => {
    if (!cls) {
      return new Date(currentTime.getTime() + 60 * 60 * 1000);
    }

    const [hours, minutes] = (isNext ? cls.period.start : cls.period.end).split(":").map(Number);
    const targetDate = new Date(currentTime);
    targetDate.setHours(hours, minutes, 0, 0);

    // If next class is on a different day
    if (isNext && nextDay && currentDay !== nextDay) {
      const allDays: DayOfWeek[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const currentDayIndex = getDayOfWeek(currentTime) ? allDays.indexOf(getDayOfWeek(currentTime)!) : -1;
      const nextDayIndex = allDays.indexOf(nextDay);

      if (currentDayIndex !== -1 && nextDayIndex !== -1) {
        const dayDiff = nextDayIndex > currentDayIndex
          ? nextDayIndex - currentDayIndex
          : 7 - currentDayIndex + nextDayIndex;
        targetDate.setDate(targetDate.getDate() + dayDiff);
      }
    }

    return targetDate;
  };

  const currentTargetTime = getTargetTime(current, false);
  const nextTargetTime = getTargetTime(next, true);

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.mainCard}>
        <Clock currentTime={currentTime} />

        <div style={styles.gridContainer}>
          <div style={styles.columnContainer}>
            <h2 style={styles.gridHeader}>今</h2>
            <InfoCard
              title={current ? `${currentDay ? DAY_LABELS[currentDay] + "曜日" : ""} ${getPeriodLabel(current.period.start, current.period.end)}` : "授業なし"}
              period={current ? `${current.period.start} - ${current.period.end}` : ""}
              type="end"
              targetTime={currentTargetTime}
            />
            <SubjectCard
              subject={current?.subject || "ー"}
              details={current ? `${current.room || ""}・${current.teacher || ""}` : ""}
            />
          </div>

          <div style={styles.columnContainer}>
            <h2 style={styles.gridHeader}>次</h2>
            <InfoCard
              title={next ? `${nextDay ? DAY_LABELS[nextDay] + "曜日" : ""} ${getPeriodLabel(next.period.start, next.period.end)}` : "授業なし"}
              period={next ? `${next.period.start} - ${next.period.end}` : ""}
              type="start"
              targetTime={nextTargetTime}
            />
            <SubjectCard
              subject={next?.subject || "ー"}
              details={next ? `${next.room || ""}・${next.teacher || ""}` : ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
