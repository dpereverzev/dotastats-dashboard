# Custom Suit Configurator

## Goal
Replace the current Dota draft project with an original, polished suit configurator inspired by the reference experience. The first screen will be the usable configurator, not a marketing page.

## What I’ll build
- A responsive three-part workspace: configuration/options panel, large live suit preview, and order summary.
- A guided flow for fabric, jacket, trousers, waistcoat, and finishing details.
- Searchable fabric swatches with categories, price adjustments, and selected states.
- Jacket controls for fit, buttons, lapels, pockets, vents, lining, and sleeve details.
- Trouser and waistcoat controls with the most relevant tailoring choices.
- A visual suit preview that updates by fabric/color and selected styling details.
- Persistent total price, progress, back/next navigation, summary drawer, reset, and save-to-browser behavior.
- Desktop and mobile layouts designed around the same configuration flow.

## Visual direction
- Bright editorial tailoring studio: white and soft neutral surfaces, charcoal typography, restrained burgundy accents, and crisp borders.
- Large garment-focused preview with clean option thumbnails and subtle transitions.
- Original branding, copy, garment imagery, and styling rather than copying Hockerty assets or identity.

## Cleanup
- Remove the Dota draft interface, data, helpers, and draft-specific cloud function.
- Replace old project metadata with suit-configurator title and social description.
- Keep only shared UI foundations that the new experience uses.

## Technical details
- React state will drive every option and calculated price adjustment.
- Configuration will persist locally so refreshing does not lose progress.
- Generated garment imagery will be stored in the project and layered with interface-driven color/detail treatments.
- No checkout, payment processing, customer accounts, or production inventory will be added in this scope; the final action will produce a complete configuration summary.
- The finished central flow will be checked at desktop and mobile sizes.
