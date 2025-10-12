import { type CSSProperties, useEffect, useState } from "react";
import { Clock as ClockIcon, Calendar, BookOpen } from "lucide-react";

const styles: Record<string, CSSProperties> = {
  dashboardContainer: {
    backgroundColor: "#fafaf9",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
  },
  mainCard: {
    width: "100%",
    maxWidth: "42rem",
    margin: "0 auto",
    backgroundColor: "#f5f5f4",
    padding: "1.5rem",
    borderRadius: "1rem",
    boxShadow:
      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    border: "1px solid #e5e7eb",
  },
  clock: {
    textAlign: "center",
    color: "#1f2937",
    marginBottom: "1.5rem",
  },
  clockDate: {
    fontSize: "1.25rem",
    fontWeight: 700,
  },
  clockTime: {
    fontSize: "2.25rem",
    fontWeight: 700,
    letterSpacing: "0.05em",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
    gap: "1rem",
    marginBottom: "1rem",
  },
  gridHeader: {
    fontSize: "1.25rem",
    fontWeight: 700,
    textAlign: "center",
    color: "#4b5563",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "1rem",
    borderRadius: "0.5rem",
    border: "1px solid #d1d5db",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    height: "100%",
  },
  infoCardTitle: {
    fontSize: "1.125rem",
    fontWeight: 700,
    color: "#374151",
  },
  infoCardPeriod: {
    fontSize: "0.875rem",
    color: "#6b7280",
    marginBottom: "0.5rem",
  },
  infoCardCountdown: {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: "1.5rem",
    color: "#4f46e5",
  },
  infoCardCountdownLabel: {
    fontWeight: 700,
  },
  infoCardCountdownTime: {
    marginLeft: "0.5rem",
  },
  subjectCardTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#1f2937",
  },
  subjectCardDetails: {
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

export const TimeDashboard = () => {
  const currentTime = useCurrentTime();

  const today19 = new Date(
    currentTime.getFullYear(),
    currentTime.getMonth(),
    currentTime.getDate(),
    19,
    0,
    0,
  );
  const tomorrow9 = new Date(
    currentTime.getFullYear(),
    currentTime.getMonth(),
    currentTime.getDate() + 1,
    9,
    0,
    0,
  );

  const currentLessonEndTime =
    currentTime > today19
      ? new Date(today19.getTime() + 24 * 60 * 60 * 1000)
      : today19;

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.mainCard}>
        <Clock currentTime={currentTime} />

        <div style={styles.gridContainer}>
          <h2 style={styles.gridHeader}>今</h2>
          <h2 style={styles.gridHeader}>次</h2>
          <InfoCard
            title="今日 6限"
            period="18:00 - 19:00"
            type="end"
            targetTime={currentLessonEndTime}
          />
          <InfoCard
            title="明日 1限"
            period="9:00 - 10:30"
            type="start"
            targetTime={tomorrow9}
          />
        </div>

        <div style={styles.gridContainer}>
          <SubjectCard subject="英語" details="Foo・Foo" />
          <SubjectCard subject="数学" details="Bar・Bar" />
        </div>
      </div>
    </div>
  );
};
