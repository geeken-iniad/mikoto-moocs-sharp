import {
  ContentStyleEnhancer,
  CourseListEnhancer,
  DualViewManager,
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
  </StorageProvider>
);
