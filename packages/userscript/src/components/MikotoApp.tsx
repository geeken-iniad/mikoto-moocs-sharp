import {
  ContentEnhancer,
  CourseListEnhancer,
  SidebarEnhancer,
  StorageProvider,
  TextareaEnhancer,
} from "@mikoto-moocs-sharp/shared";
import { storageManager } from "../utils/storage";

/**
 * Mikoto MOOCs # メインアプリケーションコンポーネント
 * すべてのエンハンサーを統合
 */
export const MikotoApp = () => (
  <StorageProvider storageManager={storageManager}>
    <ContentEnhancer />
    <SidebarEnhancer />
    <TextareaEnhancer />
    <CourseListEnhancer />
  </StorageProvider>
);
