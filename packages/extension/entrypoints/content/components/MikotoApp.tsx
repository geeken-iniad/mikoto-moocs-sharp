import {
  ContentStyleEnhancer,
  CourseListEnhancer,
  DualViewManager,
  KeyboardShortcuts,
  SidebarEnhancer,
  StorageProvider,
  TextareaCounter,
  TextareaResizer,
} from "@mikoto-moocs-sharp/shared";
import { storageManager } from "../../utils/storage";

export const MikotoApp = () => (
  <StorageProvider storageManager={storageManager}>
    <ContentStyleEnhancer />
    <CourseListEnhancer />
    <DualViewManager />
    <KeyboardShortcuts />
    <SidebarEnhancer />
    <TextareaCounter />
    <TextareaResizer />
  </StorageProvider>
);
