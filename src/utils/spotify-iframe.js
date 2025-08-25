let loading;
export async function getIFrameAPI() {
  if (typeof window === "undefined") return null;
  if (window.SpotifyIframeApi) return window.SpotifyIframeApi;
  if (loading) return loading;

  loading = new Promise((resolve) => {
    window.onSpotifyIframeApiReady = (IFrameAPI) => resolve(IFrameAPI);
    const s = document.createElement("script");
    s.src = "https://open.spotify.com/embed/iframe-api/v1";
    s.async = true;
    document.head.appendChild(s);
  });

  return loading;
}
