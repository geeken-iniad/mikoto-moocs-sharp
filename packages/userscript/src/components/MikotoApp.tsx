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
  React.useEffect(() => {
    console.log("[Mikoto (MOOCs #)]: MikotoApp mounted");
    console.log("[Mikoto (MOOCs #)]: Current URL:", window.location.href);
    console.log("[Mikoto (MOOCs #)]: document.body exists:", !!document.body);
  }, []);

  return (
    <>
      <ContentEnhancer />
      <SidebarEnhancer />
      <TextareaEnhancer />
      <CourseListEnhancer />
    </>
  );
};
