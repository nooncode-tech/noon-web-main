const INTERNAL_REVIEW_FLAGS_SECTION =
  /(?:\r?\n)+---(?:\r?\n)+(?:\r?\n)_PM Review Flags \(internal only\):_([\s\S]*)$/;

export type ProposalBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered_list"; items: string[] }
  | { type: "ordered_list"; items: string[] }
  | { type: "divider" };

function normalizeContent(content: string | null | undefined): string {
  return (content ?? "").replace(/\r\n/g, "\n").trim();
}

function isStandaloneBoldHeading(line: string): boolean {
  return /^\*\*[^*].*[^*]\*\*$/.test(line.trim());
}

function isOrderedItem(line: string): boolean {
  return /^\d+\.\s+/.test(line.trim());
}

function isUnorderedItem(line: string): boolean {
  return /^-\s+/.test(line.trim());
}

function isMarkdownHeading(line: string): boolean {
  return /^#{1,6}\s+/.test(line.trim());
}

function isDivider(line: string): boolean {
  return line.trim() === "---";
}

function isBlockStart(line: string): boolean {
  return (
    line.trim().length === 0 ||
    isDivider(line) ||
    isMarkdownHeading(line) ||
    isStandaloneBoldHeading(line) ||
    isOrderedItem(line) ||
    isUnorderedItem(line)
  );
}

export function stripInternalReviewFlags(content: string | null | undefined): string {
  const normalized = normalizeContent(content);
  if (!normalized) {
    return "";
  }

  return normalized.replace(INTERNAL_REVIEW_FLAGS_SECTION, "").trimEnd();
}

export function extractInternalReviewFlags(content: string | null | undefined): string[] {
  const normalized = normalizeContent(content);
  if (!normalized) {
    return [];
  }

  const match = normalized.match(INTERNAL_REVIEW_FLAGS_SECTION);
  const rawFlags = match?.[1];
  if (!rawFlags) {
    return [];
  }

  return rawFlags
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace(/^- /, "").trim())
    .filter(Boolean);
}

export function parseProposalBlocks(content: string | null | undefined): ProposalBlock[] {
  const clean = stripInternalReviewFlags(content);
  if (!clean) {
    return [];
  }

  const lines = clean.split("\n");
  const blocks: ProposalBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (isDivider(line)) {
      blocks.push({ type: "divider" });
      index += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = Math.min(headingMatch[1].length, 3) as 1 | 2 | 3;
      blocks.push({ type: "heading", level, text: headingMatch[2].trim() });
      index += 1;
      continue;
    }

    if (isStandaloneBoldHeading(line)) {
      blocks.push({
        type: "heading",
        level: 3,
        text: line.replace(/^\*\*|\*\*$/g, "").trim(),
      });
      index += 1;
      continue;
    }

    if (isOrderedItem(line)) {
      const items: string[] = [];
      while (index < lines.length && isOrderedItem(lines[index])) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, "").trim());
        index += 1;
      }
      blocks.push({ type: "ordered_list", items });
      continue;
    }

    if (isUnorderedItem(line)) {
      const items: string[] = [];
      while (index < lines.length && isUnorderedItem(lines[index])) {
        items.push(lines[index].trim().replace(/^-\s+/, "").trim());
        index += 1;
      }
      blocks.push({ type: "unordered_list", items });
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length && !isBlockStart(lines[index])) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    if (paragraphLines.length > 0) {
      blocks.push({
        type: "paragraph",
        text: paragraphLines.join(" ").replace(/\s+/g, " ").trim(),
      });
    }
  }

  return blocks;
}
