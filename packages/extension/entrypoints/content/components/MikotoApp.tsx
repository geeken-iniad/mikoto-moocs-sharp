import {
  ContentEnhancer,
  CourseListEnhancer,
  SidebarEnhancer,
  StorageProvider,
  TextareaEnhancer,
} from "@mikoto-moocs-sharp/shared";
import { storageManager } from "../../utils/storage";

export const MikotoApp = () => (
  <StorageProvider storageManager={storageManager}>
    <SidebarEnhancer />
    <ContentEnhancer />
    <TextareaEnhancer />
    <CourseListEnhancer />
  </StorageProvider>
);
