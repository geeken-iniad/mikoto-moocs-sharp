import React from "react";
import { ContentEnhancer } from "./enhancers/ContentEnhancer";
import { SidebarEnhancer } from "./enhancers/SidebarEnhancer";
import { TextareaEnhancer } from "./enhancers/TextareaEnhancer";
import { CourseListEnhancer } from "./enhancers/CourseListEnhancer";

export const MikotoApp: React.FC = () => {
  return (
    <>
      <SidebarEnhancer />
      <ContentEnhancer />
      <TextareaEnhancer />
      <CourseListEnhancer />
    </>
  );
};
