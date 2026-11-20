export const REGISTER_URL = 'https://nextwavesys.com/register?ref=Account';

export const SUPPORT_PHONE = '+255626684874';
export const SUPPORT_PHONE_DISPLAY = '+255 626 684 874';
export const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029VbDstVF3QxS8zWjUJE1w';

export const HERO_IMAGE = '/src/assets/images/hero_tvideo_commerce_1795021482668.jpg';

export function buildSmsHref(message: string): string {
  return `sms:${SUPPORT_PHONE}?body=${encodeURIComponent(message)}`;
}

export function formatTsh(amount: number): string {
  return `TSh ${amount.toLocaleString('en-US')}`;
}

export function formatSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.max(0, totalSeconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
