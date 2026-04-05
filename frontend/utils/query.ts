export function compactObject<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => {
      if (fieldValue === undefined || fieldValue === null) {
        return false;
      }

      if (typeof fieldValue === "string") {
        return fieldValue.trim().length > 0;
      }

      return true;
    }),
  ) as Partial<T>;
}
