# Portfolio Motion System Design

## Intent

The opening sequence and the page-section reveals are separate animation systems.
The opening plays once per page load, removes itself completely, and then hands the
page to the normal scrolling experience. Each content section reveals independently
the first time it enters the viewport and never replays during the same page visit.

## Opening Sequence

- Display `FIFTEEN / CINEMATOGRAPHY & LIGHTING` above the masked `showreel` title.
- Let the label resolve first, then bring the video-filled title into place.
- Hold briefly before a slow, unified fade lasting about 1.4 seconds.
- Lock scrolling only while the opening overlay is mounted.
- Use a short fade for reduced-motion visitors.

## Section Reveals

- Mount the normal site only when the opening has completed so Hero text effects do
  not finish behind the overlay.
- Reveal Hero immediately after the opening handoff.
- Drive About, Projects, Expertise, and Resume with independent ScrollTrigger
  timelines that share the same curtain reveal language.
- Reveal each section by opening its clip, lifting it into place, and restoring
  brightness as its top travels through the viewport.
- Keep long sections in normal document flow and apply only subtle exit parallax so
  Projects and sticky Resume content retain their existing behavior.
- Shorten movement on mobile and settle immediately for reduced motion.

## Contact Curtain

- Keep the existing portfolio contact copy and methods unchanged.
- Reveal the final contact area as a fixed footer clipped by its own section, creating
  a curtain-like transition as the preceding page scrolls away.
- Move the large `FIFTEEN` background word and contact content on separate scrubbed
  timelines so this effect remains independent from the one-time section reveals.
- Add restrained magnetic feedback to contact links on fine pointers only.
- Do not import the reference component's product copy, marquee, download controls,
  branding, Tailwind utilities, shadcn structure, or TypeScript requirements.

## Verification

- Check opening, handoff, body scroll restoration, and one-time section behavior.
- Check desktop, mobile, and reduced-motion rendering.
- Run project asset, interaction, data, and production-build checks.
