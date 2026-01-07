import type { CSSProperties } from "react";

/**
 * 共通カラーパレット
 */
export const colors = {
  // Primary
  primary: "#3b82f6",
  primaryHover: "#2563eb",
  
  // Secondary
  secondary: "#6b7280",
  
  // Danger
  danger: "#ef4444",
  dangerHover: "#dc2626",
  
  // Success
  success: "#22c55e",
  
  // Text
  textDark: "#1f2937",
  textMedium: "#374151",
  textLight: "#6b7280",
  textMuted: "#9ca3af",
  
  // Background
  bgWhite: "#ffffff",
  bgLight: "#f9fafb",
  bgGray: "#f3f4f6",
  bgBlueLight: "#eff6ff",
  bgGreenLight: "#f0fdf4",
  
  // Border
  border: "#dcdfe6",
  borderLight: "#e5e7eb",
  borderDark: "#d1d5db",
} as const;

/**
 * 共通スペーシング
 */
export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
} as const;

/**
 * 共通フォントサイズ
 */
export const fontSize = {
  xs: "12px",
  sm: "14px",
  base: "16px",
  lg: "18px",
  xl: "20px",
  "2xl": "24px",
} as const;

/**
 * 共通フォントウェイト
 */
export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/**
 * 共通ボーダーラディウス
 */
export const borderRadius = {
  sm: "4px",
  md: "6px",
  lg: "8px",
  xl: "12px",
} as const;

/**
 * 共通スタイル: セクションタイトル（統一サイズ）
 */
export const sectionTitle: CSSProperties = {
  fontSize: fontSize.lg,      // 1.125rem に統一
  fontWeight: fontWeight.semibold,  // 600
  color: colors.textDark,
  marginBottom: spacing.md,
};

/**
 * 共通スタイル: セクションコンテナ
 */
export const section: CSSProperties = {
  padding: "20px",
  borderBottom: `1px solid ${colors.border}`,
};

/**
 * 共通スタイル: 説明文
 */
export const description: CSSProperties = {
  fontSize: fontSize.sm,
  color: colors.textLight,
  marginTop: spacing.sm,
};

/**
 * 共通スタイル: ラベル
 */
export const label: CSSProperties = {
  display: "block",
  marginBottom: spacing.sm,
  fontSize: fontSize.sm,
  fontWeight: fontWeight.medium,
  color: colors.textMedium,
};

/**
 * 共通スタイル: 入力フィールド
 */
export const input: CSSProperties = {
  padding: "10px",
  fontSize: fontSize.sm,
  border: `1px solid ${colors.border}`,
  borderRadius: borderRadius.xl,
  backgroundColor: colors.bgWhite,
};

/**
 * 共通スタイル: セレクトボックス
 */
export const select: CSSProperties = {
  padding: "10px",
  fontSize: fontSize.sm,
  border: `1px solid ${colors.border}`,
  borderRadius: borderRadius.xl,
  backgroundColor: colors.bgWhite,
  cursor: "pointer",
  minWidth: "200px",
};

/**
 * 共通スタイル: プライマリボタン
 */
export const buttonPrimary: CSSProperties = {
  padding: "10px 20px",
  fontSize: fontSize.sm,
  fontWeight: fontWeight.medium,
  backgroundColor: colors.primary,
  color: colors.bgWhite,
  border: "none",
  borderRadius: borderRadius.xl,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: spacing.sm,
};

/**
 * 共通スタイル: セカンダリボタン
 */
export const buttonSecondary: CSSProperties = {
  padding: "10px 20px",
  fontSize: fontSize.sm,
  fontWeight: fontWeight.medium,
  backgroundColor: colors.bgGray,
  color: colors.textMedium,
  border: "none",
  borderRadius: borderRadius.xl,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: spacing.sm,
};

/**
 * 共通スタイル: 危険なボタン
 */
export const buttonDanger: CSSProperties = {
  padding: "10px 20px",
  fontSize: fontSize.sm,
  fontWeight: fontWeight.medium,
  backgroundColor: colors.danger,
  color: colors.bgWhite,
  border: "none",
  borderRadius: borderRadius.xl,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: spacing.sm,
};

/**
 * 共通スタイル: チェックボックス
 */
export const checkbox: CSSProperties = {
  width: "18px",
  height: "18px",
  cursor: "pointer",
};

/**
 * 共通スタイル: チェックボックスラベル
 */
export const checkboxLabel: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: spacing.sm,
  fontSize: fontSize.base,
  cursor: "pointer",
};

