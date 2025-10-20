let handler: ((open: boolean) => void) | null = null;

export const registerSettingsModalHandler = (next: (open: boolean) => void) => {
  // 既にハンドラーが登録されている場合は警告
  if (handler !== null) {
    console.warn(
      "[Mikoto] Settings modal handler is already registered. Only one handler is allowed at a time.",
    );
  }

  handler = next;

  return () => {
    if (handler === next) {
      handler = null;
    }
  };
};

export const openSettingsModal = () => {
  handler?.(true);
};

export const closeSettingsModal = () => {
  handler?.(false);
};
