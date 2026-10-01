export interface FormSectionPosition {
  value: string;
  top: number;
  bottom: number;
}

export function activeFormSection(
  sections: FormSectionPosition[],
  anchor: number,
  visibleBottom: number,
  atPageEnd: boolean
) {
  const last = sections[sections.length - 1];
  if (atPageEnd && last && last.top < visibleBottom && last.bottom > anchor) {
    return last.value;
  }

  let active = sections[0]?.value;
  for (const section of sections) {
    if (section.top > anchor) break;
    active = section.value;
  }
  return active;
}

export function sectionScrollTop(
  top: number,
  scrollY: number,
  offset: number,
  maxScroll: number
) {
  return Math.min(Math.max(0, top + scrollY - offset), Math.max(0, maxScroll));
}
