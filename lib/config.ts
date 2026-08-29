export const correctionEmail =
  process.env.NEXT_PUBLIC_CORRECTION_EMAIL?.trim() ?? '';

export function correctionHref(communityName: string) {
  if (!correctionEmail) return null;
  const subject = encodeURIComponent(
    `Squashie listing update: ${communityName}`,
  );
  const body = encodeURIComponent(
    `Hello Squashie,\n\nI would like to suggest an update or verify the listing for ${communityName}.\n\nWhat should change:\n\nSource or organizer role:\n\nThank you.`,
  );
  return `mailto:${correctionEmail}?subject=${subject}&body=${body}`;
}
