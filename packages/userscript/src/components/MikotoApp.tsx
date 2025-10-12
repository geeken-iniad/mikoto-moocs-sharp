import React from "react";
import {
  createContentEnhancer,
  createCourseListEnhancer,
  SidebarEnhancer,
  TextareaEnhancer,
} from "@mikoto-moocs-sharp/shared";
import { storageManager } from "../utils/storage";

// storageManagerに依存するコンポーネントはファクトリーから生成
const ContentEnhancer = createContentEnhancer(storageManager);
const CourseListEnhancer = createCourseListEnhancer(storageManager);

/**
 * Mikoto MOOCs # メインアプリケーションコンポーネント
 * すべてのエンハンサーを統合
 */
export const MikotoApp: React.FC = () => {
  return (
    <>
      <ContentEnhancer />
      <SidebarEnhancer />
      <TextareaEnhancer />
      <CourseListEnhancer />
    </>
  );
};
