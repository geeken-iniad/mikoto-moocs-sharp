import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertBanner } from "../components/AlertBanner";
import { useSettingsContext } from "../hooks/useSettingsContext";

type Alert = {
  id: string;
  message: string;
};

let originalAlert: ((message?: any) => void) | null = null;

export const CustomAlertsManager = () => {
  const { settings } = useSettingsContext();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (settings.enableCustomAlerts) {
      if (!originalAlert) {
        originalAlert = window.alert;
      }

      window.alert = (message: string) => {
        const id = `alert-${Date.now()}-${Math.random()}`;
        setAlerts((prevAlerts) => [...prevAlerts, { id, message }]);
      };
    } else {
      if (originalAlert) {
        window.alert = originalAlert;
        originalAlert = null;
      }
    }

    return () => {
      if (originalAlert) {
        window.alert = originalAlert;
        originalAlert = null;
      }
    };
  }, [settings.enableCustomAlerts]);

  const handleClose = (id: string) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  };

  return createPortal(
    <>
      {alerts.map(({ id, message }) => (
        <AlertBanner key={id} id={id} message={message} onClose={handleClose} />
      ))}
    </>,
    document.body
  );
};