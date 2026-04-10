import { Alert, Platform } from 'react-native';

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

/**
 * Cross-platform alert helper.
 *
 * - On iOS / Android it delegates to the native `Alert.alert`.
 * - On web it uses `window.confirm` for 2-button dialogs and `window.alert`
 *   for single-button (informational) dialogs, then invokes the appropriate
 *   button callback synchronously.
 */
export function crossAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[]
): void {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons as any);
    return;
  }

  // ── Web fallback ──────────────────────────────────────────────────────────
  const btns = buttons ?? [{ text: 'OK' }];

  // Separate cancel button from the confirm buttons
  const cancelBtn = btns.find((b) => b.style === 'cancel');
  const actionBtns = btns.filter((b) => b.style !== 'cancel');

  if (actionBtns.length === 0) {
    // Pure informational alert – just show and call the only handler
    window.alert(`${title}${message ? '\n\n' + message : ''}`);
    cancelBtn?.onPress?.();
    return;
  }

  if (actionBtns.length === 1) {
    // One action + optional cancel  →  use confirm()
    const confirmed = window.confirm(
      `${title}${message ? '\n\n' + message : ''}`
    );
    if (confirmed) {
      actionBtns[0].onPress?.();
    } else {
      cancelBtn?.onPress?.();
    }
    return;
  }

  // Multiple action buttons: present a prompt so the user can type the button
  // label they want (last-resort fallback; rare in this app).
  const labels = actionBtns.map((b, i) => `${i + 1}. ${b.text}`).join('\n');
  const raw = window.prompt(
    `${title}${message ? '\n\n' + message : ''}\n\n${labels}\n\nEnter option number (or cancel):`
  );
  if (raw === null) {
    cancelBtn?.onPress?.();
    return;
  }
  const idx = parseInt(raw, 10) - 1;
  if (idx >= 0 && idx < actionBtns.length) {
    actionBtns[idx].onPress?.();
  } else {
    cancelBtn?.onPress?.();
  }
}
