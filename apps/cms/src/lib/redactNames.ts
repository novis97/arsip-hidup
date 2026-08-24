export const NAME_REDACTION_STOPWORDS = new Set([
  "sari",
  "laras",
  "wening",
  "ratih",
  "indah",
  "mulya",
  "rahayu",
  "lestari",
  "tirta",
  "warna",
  "kembang",
  "melati",
  "wangi",
  "arum",
  "endah",
  "sekar",
]);

export type NameRedaction = {
  word: string;
  count: number;
};

export type NameRedactionResult = {
  text: string | null | undefined;
  redactions: NameRedaction[];
};

export type ValueRedactionResult = {
  value: unknown;
  redactions: NameRedaction[];
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const boundedPattern = (value: string) =>
  new RegExp(
    `(?<![\\p{L}\\p{N}_])${escapeRegExp(value)}(?![\\p{L}\\p{N}_])`,
    "gu",
  );

export function redactNames(
  text: string | null | undefined,
  originalNames: string[],
  replacementLabel: string,
): NameRedactionResult {
  if (typeof text !== "string" || text.length === 0) {
    return { text, redactions: [] };
  }

  const counts = new Map<string, number>();
  let redactedText = text;
  const names = [...new Set(originalNames.map((name) => name.trim()))]
    .filter(Boolean)
    .sort((left, right) => right.length - left.length);

  for (const name of names) {
    redactedText = redactedText.replace(boundedPattern(name), () => {
      counts.set(name, (counts.get(name) ?? 0) + 1);
      return replacementLabel;
    });
  }

  const words = [
    ...new Set(
      names.flatMap((name) =>
        name.split(" ").filter((word) => {
          return (
            [...word].length >= 5 &&
            !NAME_REDACTION_STOPWORDS.has(word.toLocaleLowerCase("id-ID"))
          );
        }),
      ),
    ),
  ].sort((left, right) => right.length - left.length);

  for (const word of words) {
    redactedText = redactedText.replace(
      new RegExp(
        `(?<![\\p{L}\\p{N}_])${escapeRegExp(word)}(?![\\p{L}\\p{N}_])`,
        "giu",
      ),
      (match) => {
        if (!/^\p{Lu}/u.test(match)) return match;
        counts.set(word, (counts.get(word) ?? 0) + 1);
        return replacementLabel;
      },
    );
  }

  return {
    text: redactedText,
    redactions: [...counts].map(([word, count]) => ({ word, count })),
  };
}

export function redactNamesInValue(
  value: unknown,
  originalNames: string[],
  replacementLabel: string,
): ValueRedactionResult {
  if (typeof value === "string") {
    const result = redactNames(value, originalNames, replacementLabel);
    return { value: result.text, redactions: result.redactions };
  }

  if (Array.isArray(value)) {
    const redactions: NameRedaction[] = [];
    const redactedValue = value.map((item) => {
      const result = redactNamesInValue(
        item,
        originalNames,
        replacementLabel,
      );
      redactions.push(...result.redactions);
      return result.value;
    });
    return { value: redactedValue, redactions };
  }

  if (value && typeof value === "object") {
    const redactions: NameRedaction[] = [];
    const redactedValue = Object.fromEntries(
      Object.entries(value).map(([key, item]) => {
        const result = redactNamesInValue(
          item,
          originalNames,
          replacementLabel,
        );
        redactions.push(...result.redactions);
        return [key, result.value];
      }),
    );
    return { value: redactedValue, redactions };
  }

  return { value, redactions: [] };
}
