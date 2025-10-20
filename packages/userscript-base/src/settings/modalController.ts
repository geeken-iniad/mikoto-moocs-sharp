let handler: ((open: boolean) => void) | null = null;

export const registerSettingsModalHandler = (next: (open: boolean) => void) => {
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
