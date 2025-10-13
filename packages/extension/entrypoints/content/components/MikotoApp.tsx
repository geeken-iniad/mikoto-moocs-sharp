import React from "react";
import {
  createContentEnhancer,
  createCourseListEnhancer,
  SidebarEnhancer,
  TextareaEnhancer,
} from "@mikoto-moocs-sharp/shared";
import { storageManager } from "../../utils/storage";

// storageManagerに依存するコンポーネントはファクトリーから生成
const ContentEnhancer = createContentEnhancer(storageManager);
const CourseListEnhancer = createCourseListEnhancer(storageManager);

export const MikotoApp: React.FC = () => (
  <>
    <SidebarEnhancer />
    <ContentEnhancer />
    <TextareaEnhancer />
    <CourseListEnhancer />
  </>
);
