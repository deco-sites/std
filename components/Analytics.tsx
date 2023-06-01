import { context } from "$live/live.ts";
import GoogleTagManager from "partytown/integrations/GTM.tsx";
import Script from "partytown/Script.tsx";
import { sendAnalyticsEvent } from "../commerce/sdk/sendAnalyticsEvent.ts";

export interface Props {
  /**
   * @description google tag manager container id. For more info: https://developers.google.com/tag-platform/tag-manager/web#standard_web_page_installation .
   */
  trackingIds?: string[];
  /**
   * @description custom url for serving google tag manager. Set either this url or the tracking id
   */
  src?: string;
  /**
   * @description run GTM directly on the main thread, without Partytown. This is useful for debugging purposes. Default: false
   */
  dangerouslyRunOnMainThread?: boolean;
}

export default function Analtyics(
  { trackingIds, src, dangerouslyRunOnMainThread }: Props,
) {
  return (
    <>
      {/* TODO: Add debug from query string @author Igor Brasileiro */}
      {/* Add Tag Manager script during production only. To test it locally remove the condition */}
      {!!context.deploymentId && trackingIds && (
        trackingIds.map((trackingId) => (
          <GoogleTagManager
            trackingId={trackingId.trim()}
            dangerouslyRunOnMainThread={dangerouslyRunOnMainThread}
          />
        ))
      )}
      {!!context.deploymentId && src && (
        <GoogleTagManager
          src={src}
          dangerouslyRunOnMainThread={dangerouslyRunOnMainThread}
        />
      )}

      <Script
        dangerouslySetInnerHTML={{
          // add all globals variables here
          __html:
            `debugGlobals = () => { console.table([["datalayer", dataLayer]]); }`,
        }}
        forward={["debugGlobals"]}
      />
      <script
        id="analytics-script"
        dangerouslySetInnerHTML={{
          __html:
            `window.DECO_SITES_STD = { sendAnalyticsEvent: ${sendAnalyticsEvent.toString()} }`,
        }}
      />
    </>
  );
}
