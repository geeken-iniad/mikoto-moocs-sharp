import type { StorageManager } from "@mikoto-moocs-sharp/shared";
import {
  ContentEnhancer,
  CourseListEnhancer,
  SidebarEnhancer,
  StorageProvider,
  TextareaEnhancer,
} from "@mikoto-moocs-sharp/shared";

/**
 * Mikoto MOOCs # メインアプリケーションコンポーネント
 * すべてのエンハンサーを統合
 */
export const MikotoApp = ({
  storageManager,
}: {
  storageManager: StorageManager;
}) => (
  <StorageProvider storageManager={storageManager}>
    <ContentEnhancer />
    <SidebarEnhancer />
    <TextareaEnhancer />
    <CourseListEnhancer />
  </StorageProvider>
);
