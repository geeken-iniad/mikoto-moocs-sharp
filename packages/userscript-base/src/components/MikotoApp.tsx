import type { StorageManager } from "@mikoto-moocs-sharp/shared";
import {
  ContentStyleEnhancer,
  CourseListEnhancer,
  DualViewManager,
  ErrorBoundary,
  HoverSubmit,
  KeyboardShortcuts,
  SidebarDeckButton,
  SidebarEnhancer,
  StorageProvider,
  TextareaCounter,
  TextareaResizer,
} from "@mikoto-moocs-sharp/shared";
import { SettingsManager } from "./SettingsManager";

/**
 * Mikoto MOOCs# Pro版メインアプリケーションコンポーネント
 * すべてのエンハンサーを統合（UI・UX改善 + キーボードショートカット）
 */
export const MikotoApp = ({
  storageManager,
}: {
  storageManager: StorageManager;
}) => (
  <StorageProvider storageManager={storageManager}>
    <ErrorBoundary>
      <ContentStyleEnhancer />
      <CourseListEnhancer />
      <DualViewManager />
      <KeyboardShortcuts />
      <SidebarDeckButton />
      <SidebarEnhancer />
      <TextareaCounter />
      <TextareaResizer />
      <HoverSubmit />
      <SettingsManager storageManager={storageManager} />
    </ErrorBoundary>
  </StorageProvider>
);
