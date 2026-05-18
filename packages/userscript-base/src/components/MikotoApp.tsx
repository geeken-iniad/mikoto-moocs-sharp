import type { StorageManager } from "@mikoto-moocs-sharp/shared/storage";
import { StorageProvider } from "@mikoto-moocs-sharp/shared/storage";
import {
  ContentStyleEnhancer,
  CourseListEnhancer,
  DualViewManager,
  HoverSubmit,
  KeyboardShortcuts,
  SidebarDeckButton,
  SidebarEnhancer,
  TextareaCounter,
  TextareaResizer,
} from "@mikoto-moocs-sharp/shared/ui";
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
  </StorageProvider>
);
