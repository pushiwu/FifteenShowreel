# About ASCII Portrait Design

## Goal

Replace the static portrait rendering in the About section with a restrained Canvas2D treatment inspired by the Spider Man BND ASCII look. The portrait must remain immediately recognizable; the sampled line field is a moving surface treatment, not a replacement for the subject.

## Scope

- Apply the effect only to the existing About portrait.
- Preserve the current About layout, crop, glow, caption, bilingual statement, links, and section motion.
- Continue using `/about-profile.webp` as the source image.
- Do not add WebGL or third-party rendering dependencies.

## Component Boundary

Create a focused `AsciiPortrait` component that owns image loading, Canvas2D sampling, rendering, animation lifecycle, and fallback behavior. About supplies the source, accessible alternative text, and presentation class names.

The source image remains in the DOM as the accessible and failure-safe layer. The canvas is decorative and uses `aria-hidden="true"`.

## Visual Treatment

- Draw a lightly blurred, desaturated copy of the source portrait at 50% opacity.
- Sample the portrait on a grid with a desktop cell size near 10 CSS pixels and a slightly larger mobile cell size.
- Render short line segments from sampled luminance, color, and local edge strength.
- Dark and high-detail regions receive longer, denser lines; highlights remain more open.
- Use a warm gray-brown line palette integrated with the site's existing blue-gray atmosphere.
- Composite the line field with a color-dodge-like blend while limiting highlights to avoid clipped facial features.
- Add a fixed vignette, subtle animated film grain, restrained luminance flicker, and occasional narrow horizontal glitch bands.
- Do not translate or distort the subject itself. Motion belongs to the sampled surface and post-effects only.

## Rendering Pipeline

1. Load and decode `/about-profile.webp`.
2. Measure the rendered container and size the canvas for its CSS dimensions and a capped device-pixel ratio.
3. Draw the image with the same contain-style framing as the current portrait, including its visual scale and offset.
4. Build a low-resolution sampling canvas and cache luminance, RGB, and edge-strength data for every grid cell.
5. For each rendered frame, paint the preserved portrait background, sampled line field, vignette, grain, flicker, and low-frequency glitch bands.
6. Re-sample only when the image, container size, or responsive cell size changes. Animation frames reuse cached samples and never call `getImageData` over the full portrait.

## Animation Lifecycle

- Animate only when the About portrait intersects the viewport and the document is visible.
- Cap animation at 24 FPS on desktop and 15 FPS on compact viewports.
- Pause the requestAnimationFrame loop when the portrait leaves the viewport or the document becomes hidden.
- Resume without restarting image loading or sampling.
- In `prefers-reduced-motion: reduce`, draw one static processed frame and redraw only after resize or source changes.

## Responsive Behavior

- Preserve the existing desktop and mobile portrait footprint.
- Prevent canvas overflow and horizontal page overflow.
- Cap render resolution to avoid excessive high-DPI memory use.
- Increase the effective cell size and reduce post-effect intensity on compact viewports so the face remains legible.

## Failure Handling

- Keep the source image visible until the first processed frame is ready.
- If image decoding, Canvas2D setup, pixel sampling, or rendering fails, leave the source image visible and do not retry continuously.
- Canvas rendering must not block About text or navigation interaction.

## Performance Requirements

- No WebGL context and no new runtime dependency.
- No continuous full-resolution `getImageData` calls.
- No animation while offscreen, hidden, or under reduced motion.
- All observers, media-query listeners, resize observers, and animation frames must be cleaned up on unmount.
- The existing optimized WebP portrait remains within the current 1.5 MB asset budget.

## Verification

- The portrait remains recognizable before and after the effect becomes ready.
- The visible treatment includes sampled lines, subtle grain, vignette, flicker, and restrained glitch behavior.
- The About layout and accessible portrait description remain intact.
- Desktop and mobile layouts do not overflow.
- Reduced motion renders a stable static frame.
- Leaving the About section and hiding the tab stops frame scheduling.
- Existing asset, data, interaction, orbit, performance, and production-build checks continue to pass.
