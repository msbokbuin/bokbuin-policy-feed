"use client";

export function ShareButton({ title }: { title: string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        const shareUrl = window.location.href;

        try {
          if (navigator.share) {
            await navigator.share({ title, url: shareUrl });
          } else {
            await navigator.clipboard.writeText(shareUrl);
            alert("링크를 복사했어요!");
          }
        } catch (e) {
          console.log("share canceled or failed", e);
        }
      }}
      className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:opacity-80"
    >
      공유/복사
    </button>
  );
}
