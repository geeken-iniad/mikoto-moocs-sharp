import type { StorageManager } from "@mikoto-moocs-sharp/shared";
import {
  ContentStyleEnhancer,
  CourseListEnhancer,
  DualViewManager,
  SidebarEnhancer,
  StorageProvider,
  TextareaCounter,
  TextareaResizer,
} from "@mikoto-moocs-sharp/shared";

/**
 * Mikoto MOOCs# Lite版メインアプリケーションコンポーネント
 * UI・UX改善機能のみを統合
 */
export const MikotoAppLite = ({
  storageManager,
}: {
  storageManager: StorageManager;
}) => (
  <StorageProvider storageManager={storageManager}>
    <ContentStyleEnhancer />
    <CourseListEnhancer />
    <DualViewManager />
    <SidebarEnhancer />
    <TextareaCounter />
    <TextareaResizer />
  </StorageProvider>
);
