import React from "react";

import type { CharacterCounterProps } from "../../utils";
import { countCharacters } from "../../utils";

export const CharacterCounter: React.FC<CharacterCounterProps> = ({
  value,
}) => {
  const [normalCount, noNewlinesCount, noWhitespaceCount] = [
    countCharacters(value, "normal"),
    countCharacters(value, "no-newlines"),
    countCharacters(value, "no-whitespace"),
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

  return (
    <div className="mikoto-character-counter" style={containerStyle}>
      <table style={tableStyle}>
        <tbody>
          <tr>
            <td style={labelCellStyle}>
              <div style={labelTextStyle}>
                <span>文字数</span>
                <span>:</span>
              </div>
            </td>
            <td style={{ ...cellStyle, ...numberStyle }}>{normalCount}</td>
          </tr>
          <tr>
            <td style={labelCellStyle}>
              <div style={labelTextStyle}>
                <span>文字数 (改行除く)</span>
                <span>:</span>
              </div>
            </td>
            <td style={{ ...cellStyle, ...numberStyle }}>{noNewlinesCount}</td>
          </tr>
          <tr>
            <td style={labelCellStyle}>
              <div style={labelTextStyle}>
                <span>文字数 (改行・空白除く)</span>
                <span>:</span>
              </div>
            </td>
            <td style={{ ...cellStyle, ...numberStyle }}>
              {noWhitespaceCount}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
