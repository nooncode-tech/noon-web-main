const INTERNAL_REVIEW_FLAGS_MARKER = /(?:\r?\n)+---(?:\r?\n)+(?:\r?\n)_PM Review Flags \(internal only\):_[\s\S]*$/;

export function stripInternalReviewFlags(content: string | null | undefined): string {
  if (!content) {
    return "";
  }
  return content.replace(INTERNAL_REVIEW_FLAGS_MARKER, "").trimEnd();
}
