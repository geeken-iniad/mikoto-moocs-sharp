import { createCourseListEnhancer } from "@mikoto-moocs-sharp/shared";
import { storageManager } from "../../../utils/storage";

export const CourseListEnhancer = createCourseListEnhancer(storageManager);
