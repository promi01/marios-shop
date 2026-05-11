'use client';

/**
 * Copy `text` to the OS clipboard.
 *
 * Primary path: `navigator.clipboard.writeText` (modern browsers; requires
 * a secure context — HTTPS or localhost). Per CONTEXT D-24 this is the
 * preferred path; the textarea fallback below only kicks in when the
 * Clipboard API is unavailable (older browsers, non-secure contexts) or
 * when the primary path rejects (e.g. permissions, missing user gesture).
 *
 * Fallback: a hidden off-screen `<textarea>` + `document.execCommand('copy')`.
 * The textarea is positioned at `top: 0; left: 0` with `opacity: 0` so it
 * stays invisible without breaking the selection model; `readonly` prevents
 * the iOS soft keyboard from popping up during the copy operation.
 *
 * Returns `true` on success, `false` on failure. Per CONTEXT D-24 the caller
 * shows the same success/error toast regardless of which path won — no
 * graceful-fallback wording differentiation in Phase 1.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Primary path — modern Clipboard API.
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the legacy textarea path below.
    }
  }

  // Legacy fallback — off-screen textarea + execCommand('copy').
  if (typeof document === 'undefined') return false;

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '0';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);
  textarea.select();

  let success = false;
  try {
    success = document.execCommand('copy');
  } catch {
    success = false;
  } finally {
    document.body.removeChild(textarea);
  }
  return success;
}
