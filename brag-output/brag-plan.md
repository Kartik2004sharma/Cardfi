# CardFi — product walkthrough

## Planning rubric
1. CardFi is a MetaMask Card dashboard with spending insights and a USDC vault workflow.
2. The source headline is “Turn Every Swipe Into Smart Yield.” Retain the accepted opening and ending; demonstrate the UI in between.
3. Visual hook: the existing black/green typography and payment card.
4. Product proof: the dashboard, actual sample card transactions, spending categories, and the deposit form from the source components.
5. Duration: 22 seconds, 1920 × 1080, 30 fps.
6. Tone: polished. A continuous product demonstration with crisp native UI, deliberate scrolling, a cursor, and readable holds.
7. Audio: the existing vol-12 music bed, two restrained UI accents, a final fade. No narration. No audio-reactive movement in the product: its stillness makes the interaction readable.
8. Share caption: CardFi brings MetaMask Card activity, spending insights, and USDC vault controls into one dashboard.
9. Flow: overview → inspect card activity → enter a USDC amount → review the approval step. Stop before signing; do not invent a completed on-chain transaction or positive return.

## Source and truthfulness
The middle is a high-resolution HTML recreation of the actual interface, using `LiveVaultDashboard.tsx`, `MetaMaskCardDashboard.tsx`, `EnhancedMetaMaskStatus.tsx`, the actual dashboard screenshot, and the sample merchants in `lib/enhanced-metamask.ts`. Preserve the product's labels and UI structure; adapt spacing for a readable video. Card activity remains labeled “Sample Data”; the frame identifies the sequence as a UI walkthrough with illustrative balances. The $1.28 rewards and $128.24 spending match the existing screenshot and sample source. The 1,000 USDC input balance is illustrative; there is no wallet transaction, fabricated live APY, or success receipt.

## Visual identity
Background #050706, source UI #090a0b, text #f5f7f5, accent #27d17c. Use the actual Geist font shipped by the app for product UI. Retain the accepted intro/outro typography.

## Storyboard
- 0–3s: accepted hook, “EVERY SWIPE. SMART YIELD.” Payment card enters; no concept change.
- 3–7.6s: the dashboard settles into a large browser surface. Card integration, vault metrics and rewards are legible together. This is one persistent product surface, not a new screenshot per scene.
- 7.6–12.7s: scroll to the card section. Spending bars draw to the source values; three named transactions and their completed statuses hold. A subtle highlight follows the card activity, not an overlaid marketing claim.
- 12.7–19s: scroll to Deposit USDC. Cursor focuses the amount field, enters 250, and the form reveals its vault-token preview and “Approve 250 USDC” action. Cursor points to the approval step; no simulated signature or completed payment. Hold the finished form.
- 19–22s: accepted closing, “Spend normally. Let USDC do more.” CardFi and the URL hold to the last frame.

## Music cue guidance
Bundled vol-12 preset: 109.96 BPM. Activity bar reveal near 8.74s, deposit arrival near 13.11s, finished form hold near 17.47s. Natural typing timing takes priority over beat quantization. Music level 0.28; fade from 20.5s to 22s. Quiet UI click when the amount field focuses; short low-frequency product reveal accent.

## Verification and delivery
Run Hyperframes check with real browser/layout/contrast checks, capture all settled states and the exact ending, inspect frames, render the complete video, and inspect the encoded result. Extract the settled product overview as poster and bake it into frame zero. Update this existing output directory because the user requested replacement of the rejected middle scenes.
