import FacebookPixel, { FacebookPixelNoscript } from "./FacebookPixel";
import GoogleAnalytics from "./GoogleAnalytics";

// Script tags pra ficar no <head> — disparam o mais cedo possivel.
export default function TrackingScripts() {
  return (
    <>
      <FacebookPixel />
      <GoogleAnalytics />
    </>
  );
}

// Noscript fallback pra usuarios com JS off — deve ficar no <body>.
export function TrackingNoscripts() {
  return <FacebookPixelNoscript />;
}
