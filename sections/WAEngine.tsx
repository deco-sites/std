import Script from "partytown/Script.tsx";

export type Props = {
  frequency: number;
};

const WAEngine = (props: Props) => (
  <>
    <Script
      id="waengine"
      type="module"
      dangerouslySetInnerHTML={{
        __html: `
        if (!sessionStorage.getItem('sessionId')) {
            const sessionId = Math.floor(Math.random() * (2**54));
            sessionStorage.setItem('sessionId', sessionId);
        }
        
        let isFocused = true;

        window.addEventListener('focus', () => {
          isFocused = true;
        });

        window.addEventListener('blur', () => {
          isFocused = false;
        });

        function callengine() {
          if (isFocused) {
            fetch("/live/invoke/deco-sites/std/loaders/x/realtime.ts" + location.pathname + location.search, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({sessionId: sessionStorage.getItem('sessionId')}),
            }).catch(err => {console.error(err)});
          }
        }
        callengine();
        const fetchInterval = setInterval(callengine, ${
          Math.max(props.frequency ?? 1, 1) * 1000
        });
        `,
      }}
    >
    </Script>
  </>
);

export default WAEngine;
