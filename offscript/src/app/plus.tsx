// The Offscript Plus paywall.
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';
import { Sticker } from '../components/Sticker';
import { Body, Button, H1, Logo, Screen } from '../components/ui';
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

  // the webhook updates the database a few seconds after paying, so check a few times
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
      Alert.alert(ok ? 'Restored ✦' : 'Nothing to restore');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen bg={colors.maroon}>
      <View style={{ alignItems: 'center', marginTop: space.xl }}>
        <Sticker name="star" size={72} />
        <Logo size={58} color={colors.butter} />
        <H1 style={{ color: colors.butter, marginTop: -space.sm }}>Plus</H1>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.lg, marginTop: space.xl }}>
        {PLUS_PERKS.map((p) => (
          <View key={p.text} style={{ width: 96, alignItems: 'center', gap: 4 }}>
            <Sticker name={p.sticker} size={44} />
            <Body style={{ color: colors.butter, fontSize: 12, textAlign: 'center' }}>{p.text}</Body>
          </View>
        ))}
      </View>

      {profile.is_plus ? (
        <Body style={{ color: colors.butter, textAlign: 'center', marginTop: space.xl }}>You’re on Plus ✦</Body>
      ) : packages.length ? (
        <View style={{ gap: space.md, marginTop: space.xl }}>
          {packages.map((pkg) => (
            <Button
              key={pkg.identifier}
              variant="butter"
              title={`${pkg.product.title.replace(/\s*\(.*\)$/, '')} · ${pkg.product.priceString}`}
              onPress={() => buy(pkg)}
              loading={busy === pkg.identifier}
            />
          ))}
        </View>
      ) : (
        <Body style={{ color: colors.butter, textAlign: 'center', marginTop: space.xl }}>
          {PLUS_PRICE_LABEL}
          {Platform.OS === 'web' || !purchasesAvailable() ? '\n(in the app store version)' : ''}
        </Body>
      )}

      <View style={{ alignItems: 'center', gap: space.md, marginTop: space.xl }}>
        <Body style={{ color: colors.cream }} onPress={restore}>
          {busy === 'restore' ? 'restoring…' : 'restore purchases'}
        </Body>
        <Body style={{ color: colors.cream }} onPress={() => router.back()}>
          not now
        </Body>
        <Body style={{ color: colors.line, fontSize: 10, textAlign: 'center' }}>
          Renews until cancelled. Cancel any time in your store settings.
        </Body>
      </View>
    </Screen>
  );
}
