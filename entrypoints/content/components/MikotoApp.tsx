import React, { createElement } from "react";
import { ContentEnhancer } from "./ContentEnhancer";
import { SidebarEnhancer } from "./SidebarEnhancer";
import { TextareaEnhancer } from "./TextareaEnhancer";

export const MikotoApp: React.FC = () => {
  return createElement(
    React.Fragment,
    null,
    createElement(SidebarEnhancer, null),
    createElement(ContentEnhancer, null),
    createElement(TextareaEnhancer, null),
  );
};
