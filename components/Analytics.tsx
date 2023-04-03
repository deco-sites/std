import { context } from "$live/live.ts";
import GoogleTagManager from "partytown/integrations/GTM.tsx";
import Script from "partytown/Script.tsx";

export interface Props {
  /**
   * @description google tag manager container id. For more info: https://developers.google.com/tag-platform/tag-manager/web#standard_web_page_installation .
   */
  trackingIds?: string[];
}

export default function Analtyics({ trackingIds }: Props) {
  return (
    <>
      {/* TODO: Add debug from query string @author Igor Brasileiro */}
      {/* Add Tag Manager script during production only. To test it locally remove the condition */}
      {!!context.deploymentId && trackingIds && (
        trackingIds.map((trackingId) => (
          <GoogleTagManager trackingId={trackingId.trim()} />
        ))
      )}

      <Script
        dangerouslySetInnerHTML={{
          // add all globals variables here
          __html:
            `debugGlobals = () => { console.table([["datalayer", dataLayer]]); }`,
        }}
        forward={["debugGlobals"]}
      />
    </>
  );
}
