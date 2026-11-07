// `document.fonts.ready` only waits for faces the browser is already fetching.
// A web font is fetched lazily, the first time something renders with it, so
// `ready` can resolve before an element's own face has even been requested;
// SplitText then measures fallback metrics and warns "called before fonts
// loaded". Asking for every face the element and its children use (family +
// weight + style) makes the wait actually cover them.
export const loadFontsFor = (root) => {
  if (!root || typeof document === "undefined" || !document.fonts) {
    return Promise.resolve();
  }
  const faces = new Set();
  [root, ...root.querySelectorAll("*")].forEach((el) => {
    const s = getComputedStyle(el);
    faces.add(`${s.fontStyle} ${s.fontWeight} 16px ${s.fontFamily}`);
  });
  return Promise.all(
    [...faces].map((face) => document.fonts.load(face).catch(() => {}))
  );
};

// Loads the faces `root` uses, then waits until the document has no font
// loads in flight at all. SplitText warns whenever `document.fonts.status` is
// "loading" — even when the pending face belongs to some other element — and
// `ready` is replaced every time a new load starts, so re-check a few times.
export const waitForFonts = async (root, maxRounds = 5) => {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await loadFontsFor(root);
    for (let i = 0; i < maxRounds && document.fonts.status === "loading"; i++) {
      await document.fonts.ready;
    }
  } catch {}
};
