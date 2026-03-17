import type { StorageManager } from "@mikoto-moocs-sharp/shared";
import {
  ContentStyleEnhancer,
  CourseListEnhancer,
  DualViewManager,
  ErrorBoundary,
  SidebarDeckButton,
  SidebarEnhancer,
  StorageProvider,
  TextareaCounter,
  TextareaResizer,
} from "@mikoto-moocs-sharp/shared";
import { SettingsManager } from "./SettingsManager";

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
    <ErrorBoundary>
      <ContentStyleEnhancer />
      <CourseListEnhancer />
      <DualViewManager />
      <SidebarDeckButton />
      <SidebarEnhancer />
      <TextareaCounter />
      <TextareaResizer />
      <SettingsManager storageManager={storageManager} />
    </ErrorBoundary>
  </StorageProvider>
);
