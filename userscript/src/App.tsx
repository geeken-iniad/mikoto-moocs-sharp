import React, { useState } from "react";
import { SettingsProvider } from "./hooks/useSettingsContext";
import { SettingsModal } from "./components/SettingsModal";
import { SettingsButton } from "./components/SettingsButton";
import { CustomAlertsManager } from "./features/CustomAlertsManager";
import { BodyClassManager } from "./features/BodyClassManager";
import { LayoutManager } from "./features/LayoutManager";
import "./styles/main.css";

export const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <SettingsProvider>
      <BodyClassManager />
      <LayoutManager />
      <CustomAlertsManager />
      <SettingsButton onClick={() => setIsModalOpen(true)} />
      <SettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </SettingsProvider>
  );
};