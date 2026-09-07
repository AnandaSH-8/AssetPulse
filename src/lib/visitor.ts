import { supabase } from '@/integrations/supabase/client';

const DEVICE_KEY = 'assetpulse-device-id';
const SESSION_KEY = 'assetpulse-visit-tracked';

const getDeviceId = () => {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
};

// Records one visit per browser session. Failures are silent: analytics must
// never break the app.
export const trackVisit = async () => {
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const deviceId = getDeviceId();
    if (!deviceId) return;
    sessionStorage.setItem(SESSION_KEY, '1');
    await supabase.functions.invoke('track-visit', {
      body: { device_id: deviceId },
    });
  } catch {
    // ignore
  }
};
