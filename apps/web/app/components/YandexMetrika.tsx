'use client';

import Script from 'next/script';

export const YANDEX_METRIKA_ID = 106342755;

export function YandexMetrika() {
  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=${YANDEX_METRIKA_ID}", "ym");

          ym(${YANDEX_METRIKA_ID}, "init", {
               clickmap:true,
               trackLinks:true,
               accurateTrackBounce:true,
               webvisor:true,
               ecommerce:"dataLayer"
          });
        `}
      </Script>
      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${YANDEX_METRIKA_ID}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}

/**
 * Функция для отправки достижения цели в МЕТРИКА
 * @param target Идентификатор цели
 */
export const reachGoal = (target: string) => {
  if (typeof window !== 'undefined' && (window as any).ym) {
    console.log('[Metrika] Reach goal:', target);
    (window as any).ym(YANDEX_METRIKA_ID, 'reachGoal', target);
  } else {
    console.warn('[Metrika] ym is not defined or SSR');
  }
};
