import type { CSSProperties } from "react";

export const settingsStyles: Record<string, CSSProperties> = {
  section: {
    padding: "20px",
    borderBottom: "1px solid #dcdfe6",
  },

  sectionTitle: {
    marginBottom: "15px",
  },

  description: {
    marginTop: "8px",
    fontSize: "12px",
    color: "#666",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: 500,
    color: "#333",
  },

  input: {
    padding: "10px",
    fontSize: "14px",
    border: "1px solid #dcdfe6",
    borderRadius: "7px",
    backgroundColor: "white",
  },

  primaryButton: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: 500,
    backgroundColor: "#3471eb",
    color: "white",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "16px",
    cursor: "pointer",
    lineHeight: 1.4,
  },

  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
    flexShrink: 0,
    margin: 0,
  },
  
  toggleLabel: {
    fontSize: "16px",
    fontWeight: 500,
    color: "#333",
  },
};

