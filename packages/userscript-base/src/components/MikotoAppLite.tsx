import type { StorageManager } from "@mikoto-moocs-sharp/shared/storage";
import { StorageProvider } from "@mikoto-moocs-sharp/shared/storage";
import {
  ContentStyleEnhancer,
  CourseListEnhancer,
  DualViewManager,
  SidebarDeckButton,
  SidebarEnhancer,
  TextareaCounter,
  TextareaResizer,
} from "@mikoto-moocs-sharp/shared/ui";
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
    <ContentStyleEnhancer />
    <CourseListEnhancer />
    <DualViewManager />
    <SidebarDeckButton />
    <SidebarEnhancer />
    <TextareaCounter />
    <TextareaResizer />
    <SettingsManager storageManager={storageManager} />
  </StorageProvider>
);
