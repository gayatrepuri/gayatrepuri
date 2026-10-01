// Subscriptions (Offscript Plus) through RevenueCat.
// RevenueCat talks to Apple / Google for us and then tells our database
// who has paid (see supabase/functions/revenuecat-webhook).
//
// In Expo Go this runs in "preview mode" (fake purchases). Real purchases
// only work in a proper build — see docs/SETUP_GUIDE.md, step 8.
import { Platform } from 'react-native';
import Purchases, { type PurchasesPackage } from 'react-native-purchases';

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
export const PLUS_ENTITLEMENT = 'plus';

let configured = false;

function apiKey() {
  if (Platform.OS === 'ios') return IOS_KEY;
  if (Platform.OS === 'android') return ANDROID_KEY;
  return undefined; // no in-app purchases on the web preview
}

export const purchasesAvailable = () => Boolean(apiKey());

export async function identifyPurchaser(userId: string) {
  const key = apiKey();
  if (!key) return;
  try {
    if (!configured) {
      // appUserID = Supabase user id, so the webhook knows whose profile to upgrade
      Purchases.configure({ apiKey: key, appUserID: userId });
      configured = true;
    } else {
      await Purchases.logIn(userId);
    }
  } catch (e) {
    console.warn('RevenueCat setup failed', e);
  }
}

export async function resetPurchaser() {
  if (!configured) return;
  try {
    await Purchases.logOut();
  } catch {
    // already anonymous — nothing to do
  }
}

export async function getPlusPackages(): Promise<PurchasesPackage[]> {
  if (!configured) return [];
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
}

/** Returns true if the purchase went through. */
export async function buyPackage(pkg: PurchasesPackage) {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return Boolean(customerInfo.entitlements.active[PLUS_ENTITLEMENT]);
  } catch (e: any) {
    if (e?.userCancelled) return false;
    throw e;
  }
}

export async function restorePurchases() {
  if (!configured) return false;
  const info = await Purchases.restorePurchases();
  return Boolean(info.entitlements.active[PLUS_ENTITLEMENT]);
}
