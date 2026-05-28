const NUMBERED_OPTION_REGEX = /^\s*\d+\s*[-.)]\s+/;

export function stripOptionNumber(value: string) {
  return value.replace(NUMBERED_OPTION_REGEX, "").trim();
}

function isInstructionLine(value: string) {
  const line = value.trim();

  return (
    /\[obrigat[óo]rio\]/i.test(line) ||
    line.endsWith("?") ||
    /^responda\b/i.test(line) ||
    /^digite\b/i.test(line) ||
    /^escolha\b/i.test(line)
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeTailSpacing(value: string) {
  const trimmed = value.trim();
  return trimmed ? `\n\n${trimmed}` : "";
}

function normalizeInlineOptionsBlock(content: string, options: string[]) {
  if (!content.includes("Opções:") || options.length < 2) return content;

  const optionPattern = options
    .map((option) => `(?:\\d+\\s*[-.)]\\s*)?${escapeRegExp(stripOptionNumber(option))}`)
    .join("\\s*");

  const blockRegex = new RegExp(`(Opções:\\s*)(?:${optionPattern})([\\s\\S]*)$`, "i");
  if (!blockRegex.test(content)) return content;

  return content.replace(
    blockRegex,
    (_, label: string, tail: string) => `${label}\n\n${normalizeListOptions(options).join("\n")}${normalizeTailSpacing(tail)}`,
  );
}

export function normalizeListOptions(options: string[] | null | undefined) {
  return (options ?? []).map((option, index) => `${index + 1}. ${stripOptionNumber(option)}`);
}

type ListFormattingStep = {
  field_type: "text" | "list";
  options?: string[] | null;
};

export function normalizeAssistantListMessage(content: string, steps?: ListFormattingStep[]) {
  if (!steps?.some((step) => step.field_type === "list" && step.options?.length)) return content;

  let normalizedContent = content;

  steps?.forEach((step) => {
    if (step.field_type !== "list" || !step.options?.length) return;
    normalizedContent = normalizeInlineOptionsBlock(normalizedContent, step.options);
  });

  const lines = normalizedContent.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    if (!/^opções:\s*$/i.test(lines[i].trim())) continue;

    const optionIndexes: number[] = [];

    for (let j = i + 1; j < lines.length; j += 1) {
      const currentLine = lines[j].trim();

      if (!currentLine) continue;
      if (isInstructionLine(currentLine) && optionIndexes.length > 0) break;

      optionIndexes.push(j);
    }

    if (optionIndexes.length < 2) continue;

    optionIndexes.forEach((lineIndex, optionIndex) => {
      lines[lineIndex] = `${optionIndex + 1}. ${stripOptionNumber(lines[lineIndex])}`;
    });
  }

  return lines.join("\n");
}