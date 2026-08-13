export const TEXT_REVEAL_MAX_LENGTH = 80;

export function shouldAnimateTextReveal(text, animateOn) {
  return animateOn !== "none" && String(text).length <= TEXT_REVEAL_MAX_LENGTH;
}

export function shouldRunProjectAutoplay({
  isPaused,
  isDocumentVisible,
  isSectionInView,
  isCompactAllView,
  itemCount,
  isModalOpen,
  prefersReducedMotion,
}) {
  return (
    !isPaused &&
    isDocumentVisible &&
    isSectionInView &&
    !isCompactAllView &&
    itemCount > 1 &&
    !isModalOpen &&
    !prefersReducedMotion
  );
}
