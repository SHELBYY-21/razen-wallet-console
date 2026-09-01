import type { Settings, TmnCredentials } from "@/lib/razen/types";
import type { TmnCreds } from "./types";

export function tmnConfigured(c: TmnCredentials) {
  return Boolean(c.tmn_key_id && c.msisdn && c.login_token && c.tmn_id);
}

export function credsOf(c: TmnCredentials, pin: string, settings?: Settings): TmnCreds {
  return {
    keyId: c.tmn_key_id,
    msisdn: c.msisdn,
    loginToken: c.login_token,
    tmnId: c.tmn_id,
    deviceId: c.device_id,
    pin,
    faceWebhook: settings?.faceauth_webhook_url,
  };
}
