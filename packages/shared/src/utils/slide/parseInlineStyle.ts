export const parseInlineStyle = (cssText: string) =>
  cssText.split(";").reduce(
    (acc, cur) => {
      const [key, value] = cur.split(":");
      if (!key || !value) return acc;
      acc[key.trim()] = value.trim();
      return acc;
    },
    {} as Record<string, string>,
  );
