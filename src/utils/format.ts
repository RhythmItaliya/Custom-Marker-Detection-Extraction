import { format } from 'date-fns';

/** Format epoch ms to "HH:mm:ss". */
export const formatTime = (ms: number): string => format(ms, 'HH:mm:ss');

/** Format epoch ms to "dd MMM yyyy at HH:mm". */
export const formatDateTime = (ms: number): string =>
    format(ms, 'dd MMM yyyy — HH:mm');

/** Format elapsed seconds to a display string. */
export const formatDuration = (seconds: string | null): string =>
    seconds ? `${seconds}s` : '—';
