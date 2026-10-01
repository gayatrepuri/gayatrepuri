// The Offscript Plus paywall.
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';
import { Body, Button, Card, H1, Logo, Screen, Script } from '../components/ui';
import { useMe } from '../lib/auth';
import { PLUS_PERKS, PLUS_PRICE_LABEL } from '../lib/constants';
import { buyPackage, getPlusPackages, purchasesAvailable, restorePurchases } from '../lib/purchases';
import { colors, space } from '../lib/theme';

export default function Plus() {
  const { profile, refreshProfile } = useMe();
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    getPlusPackages().then(setPackages).catch(() => setPackages([]));
  }, []);

  // The webhook updates the database a few seconds after paying, so check a few times.
  const waitForPlus = async () => {
    for (let i = 0; i < 6; i++) {
      await refreshProfile();
      await new Promise((r) => setTimeout(r, 1500));
    }
  };

  const buy = async (pkg: PurchasesPackage) => {
    setBusy(pkg.identifier);
    try {
      if (await buyPackage(pkg)) {
        await waitForPlus();
        Alert.alert('Welcome to Plus ✦', 'Unlimited everything. Go have fun.');
        router.back();
      }
    } catch (e: any) {
      Alert.alert('Purchase failed', e.message ?? String(e));
    } finally {
      setBusy(null);
    }
  };

  const restore = async () => {
    setBusy('restore');
    try {
      const ok = await restorePurchases();
      if (ok) await waitForPlus();
      Alert.alert(ok ? 'Restored ✦' : 'Nothing to restore', ok ? 'Your Plus subscription is back.' : 'We couldn’t find a previous subscription.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen bg={colors.maroon}>
      <View style={{ alignItems: 'center', marginTop: space.xl }}>
        <Logo size={60} color={colors.butter} />
        <H1 style={{ color: colors.butter, marginTop: space.md }}>Plus ✦</H1>
        <Script style={{ color: colors.babyBlue, textAlign: 'center' }}>for the chronically sociable academic</Script>
      </View>

      <Card tone="butter" style={{ marginTop: space.xl }}>
        {PLUS_PERKS.map((p) => (
          <Body key={p} style={{ marginBottom: space.sm }}>✦  {p}</Body>
        ))}
      </Card>

      {profile.is_plus ? (
        <Body style={{ color: colors.butter, textAlign: 'center', marginTop: space.xl }}>You’re already on Plus — thank you!</Body>
      ) : packages.length ? (
        <View style={{ gap: space.md, marginTop: space.xl }}>
          {packages.map((pkg) => (
            <Button
              key={pkg.identifier}
              variant="butter"
              title={`${pkg.product.title.replace(/\s*\(.*\)$/, '')} — ${pkg.product.priceString}`}
              onPress={() => buy(pkg)}
              loading={busy === pkg.identifier}
            />
          ))}
        </View>
      ) : (
        <Card tone="blue" style={{ marginTop: space.xl }}>
          <Body style={{ textAlign: 'center' }}>
            {PLUS_PRICE_LABEL}
            {'\n'}
            {Platform.OS === 'web' || !purchasesAvailable()
              ? 'Subscriptions work in the App Store / Google Play version of the app.'
              : 'Loading prices…'}
          </Body>
        </Card>
      )}

      <Button title="Restore purchases" variant="ghost" onPress={restore} loading={busy === 'restore'} style={{ marginTop: space.lg, borderColor: colors.butter }} />
      <Button title="Maybe later" variant="ghost" onPress={() => router.back()} style={{ marginTop: space.sm, borderWidth: 0 }} />
      <Body style={{ color: colors.cream, fontSize: 11, textAlign: 'center', marginTop: space.lg }}>
        Renews monthly until cancelled. Cancel any time in your App Store / Google Play settings. Payment is charged to your
        store account at confirmation.
      </Body>
    </Screen>
  );
}
