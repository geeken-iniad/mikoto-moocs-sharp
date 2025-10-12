import React from "react";

import {
  ContentEnhancer,
  CourseListEnhancer,
  SidebarEnhancer,
  TextareaEnhancer,
} from "./enhancers";

export const MikotoApp: React.FC = () => (
  <>
    <SidebarEnhancer />
    <ContentEnhancer />
    <TextareaEnhancer />
    <CourseListEnhancer />
  </>
);
