import React, { createElement } from "react";
import type { CharacterCounterProps } from "./types";
import { utils } from "./utils";

export const CharacterCounter: React.FC<CharacterCounterProps> = ({
  value,
}) => {
  const [normalCount, noNewlinesCount, noWhitespaceCount] = [
    utils.countCharacters(value, "normal"),
    utils.countCharacters(value, "no-newlines"),
    utils.countCharacters(value, "no-whitespace"),
  ];

  const containerStyle = {
    backgroundColor: "#f9f9f9",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontFamily: "monospace",
    fontSize: "12px",
    margin: "12px 0 12px 0",
    padding: "8px",
  } as const;

  const tableStyle = {
    borderCollapse: "collapse" as const,
    width: "100%",
  } as const;

  const cellStyle = {
    padding: "4px 8px",
    textAlign: "left" as const,
  };

  const labelCellStyle = {
    ...cellStyle,
    width: "1%",
    whiteSpace: "nowrap" as const,
    position: "relative" as const,
  };

  const labelTextStyle = {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
  };

  const numberStyle = {
    fontWeight: "bold",
    color: "#2563eb",
  };

  return createElement(
    "div",
    { className: "mikoto-character-counter", style: containerStyle },
    createElement(
      "table",
      { style: tableStyle },
      createElement(
        "tbody",
        null,
        createElement(
          "tr",
          null,
          createElement(
            "td",
            { style: labelCellStyle },
            createElement(
              "div",
              { style: labelTextStyle },
              createElement("span", null, "文字数"),
              createElement("span", null, ":"),
            ),
          ),
          createElement(
            "td",
            { style: { ...cellStyle, ...numberStyle } },
            normalCount,
          ),
        ),
        createElement(
          "tr",
          null,
          createElement(
            "td",
            { style: labelCellStyle },
            createElement(
              "div",
              { style: labelTextStyle },
              createElement("span", null, "文字数 (改行除く)"),
              createElement("span", null, ":"),
            ),
          ),
          createElement(
            "td",
            { style: { ...cellStyle, ...numberStyle } },
            noNewlinesCount,
          ),
        ),
        createElement(
          "tr",
          null,
          createElement(
            "td",
            { style: labelCellStyle },
            createElement(
              "div",
              { style: labelTextStyle },
              createElement("span", null, "文字数 (改行・空白除く)"),
              createElement("span", null, ":"),
            ),
          ),
          createElement(
            "td",
            { style: { ...cellStyle, ...numberStyle } },
            noWhitespaceCount,
          ),
        ),
      ),
    ),
  );
};
