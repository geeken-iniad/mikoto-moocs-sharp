import React from "react";

import {
  ContentEnhancer,
  CourseListEnhancer,
  IndexPageEnhancer,
  SidebarEnhancer,
  TextareaEnhancer,
} from "./enhancers";

export const MikotoApp: React.FC = () => (
  <>
    <SidebarEnhancer />
    <ContentEnhancer />
    <TextareaEnhancer />
    <CourseListEnhancer />
    <IndexPageEnhancer />
  </>
);
