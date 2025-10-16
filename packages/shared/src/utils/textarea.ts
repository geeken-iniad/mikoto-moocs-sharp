let textareaIdCounter = 0;

/**
 * Ensure that the provided textarea has a stable, globally unique identifier.
 * The identifier is stored in the dataset so multiple enhancers can reuse it.
 */
export const ensureTextareaId = (textarea: HTMLTextAreaElement): string => {
  const existingId = textarea.dataset.mikotoTextareaId;
  if (existingId) {
    return existingId;
  }

  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? `mikoto-textarea-${crypto.randomUUID()}`
      : `mikoto-textarea-${++textareaIdCounter}`;

  textarea.dataset.mikotoTextareaId = id;
  return id;
};
