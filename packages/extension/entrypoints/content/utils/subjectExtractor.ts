import { createSubjectExtractor } from "@mikoto-moocs-sharp/shared";
import { storageManager } from "../../utils/storage";

export const extractAndSaveSubjects = createSubjectExtractor(storageManager);
