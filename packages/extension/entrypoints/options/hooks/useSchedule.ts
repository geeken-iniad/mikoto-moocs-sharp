import { createUseSchedule } from "@mikoto-moocs-sharp/shared";
import { storageManager } from "../../utils/storage";

export const useSchedule = createUseSchedule(storageManager);
export type { EditingCell } from "@mikoto-moocs-sharp/shared";
