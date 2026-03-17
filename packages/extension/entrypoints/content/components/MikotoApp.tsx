import {
  ContentStyleEnhancer,
  CourseListEnhancer,
  DualViewManager,
  ErrorBoundary,
  HoverSubmit,
  KeyboardShortcuts,
  SidebarDeckButton,
  SidebarEnhancer,
  SlideEnhancer,
  SlideEnhancerManager,
  StorageProvider,
  TextareaCounter,
  TextareaResizer,
} from "@mikoto-moocs-sharp/shared";
import { storageManager } from "../../utils/storage";

export const MikotoApp = () => (
  <StorageProvider storageManager={storageManager}>
    <ErrorBoundary>
      <ContentStyleEnhancer />
      <CourseListEnhancer />
      <DualViewManager />
      <SlideEnhancerManager />
      <KeyboardShortcuts />
      <SidebarDeckButton />
      <SidebarEnhancer />
      <SlideEnhancer />
      <TextareaCounter />
      <TextareaResizer />
      <HoverSubmit />
    </ErrorBoundary>
  </StorageProvider>
);
