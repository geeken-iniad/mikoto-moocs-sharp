import { createUseScheduleHistory } from "@mikoto-moocs-sharp/shared";
import { storageManager } from "../../utils/storage";

export const useScheduleHistory = createUseScheduleHistory(storageManager);
export type { ScheduleHistory } from "@mikoto-moocs-sharp/shared";
