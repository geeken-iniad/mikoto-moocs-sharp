import { describe, expect, it } from "vitest";
import {
  createDefaultCampusSettings,
  createDefaultDualView,
  createDefaultKeyboardShortcuts,
  createDefaultNotificationSettings,
  createDefaultSlideEnhancerEnabled,
  createDefaultTheme,
} from "./defaults";

describe("settings domain defaults", () => {
  it("creates primitive setting defaults", () => {
    expect(createDefaultDualView()).toBe(false);
    expect(createDefaultSlideEnhancerEnabled()).toBe(false);
    expect(createDefaultTheme()).toBe("light");
  });

  it("creates fresh keyboard shortcut defaults", () => {
    const first = createDefaultKeyboardShortcuts();
    const second = createDefaultKeyboardShortcuts();
    first.submitShortcut = true;

    expect(second).toEqual({
      submitShortcut: false,
      numberKeyShortcut: false,
      arrowKeyShortcut: false,
    });
  });

  it("creates fresh campus and notification settings defaults", () => {
    const firstCampus = createDefaultCampusSettings();
    const secondCampus = createDefaultCampusSettings();
    firstCampus.defaultCampus = "hakusan";

    const firstNotification = createDefaultNotificationSettings();
    const secondNotification = createDefaultNotificationSettings();
    firstNotification.timings.push(-30);

    expect(secondCampus).toEqual({});
    expect(secondNotification).toEqual({ enabled: false, timings: [-10] });
  });
});
