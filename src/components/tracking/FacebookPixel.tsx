// Build for�ado: 2026-04-19T11:09:14
"use client";

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "953736244279938";

export default function FacebookPixel() {
  if (!FB_PIXEL_ID) {
    if (typeof window !== "undefined") {
      console.error(
        "[FacebookPixel] NEXT_PUBLIC_META_PIXEL_ID ausente. " +
        "Pixel tracking DESABILITADO. Conferir variáveis no Railway."
      );
    }
    return null;
  }

  const pixelCode = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${FB_PIXEL_ID}');
    fbq('track', 'PageView');
  `;

  return (
    <>
      <script
        id="fb-pixel"
        dangerouslySetInnerHTML={{ __html: pixelCode }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

