/**
 * Sets BR market_policy installment display fields when empty.
 *
 *   npx datocms cma:script scripts/seed-market-policy-installments-br.ts --profile=staging
 *   npx datocms cma:script scripts/seed-market-policy-installments-br.ts --profile=default
 */
import type { Client } from "datocms/lib/cma-client-node";

export default async function seedMarketPolicyInstallmentsBr(client: Client): Promise<void> {
  const site = await client.site.find();
  console.log(`Site ${site.id} (${site.name})`);

  const policies = await client.items.list({
    filter: { type: "market_policy" },
    version: "current",
  });

  for (const policy of policies) {
    const country = String(policy.country ?? "").toUpperCase();
    if (country !== "BR") continue;

    const count = policy.installment_count;
    const multiplier = policy.installment_multiplier;
    const needsCount = count === null || count === undefined || count === "";
    const needsMultiplier = multiplier === null || multiplier === undefined || multiplier === "";

    if (!needsCount && !needsMultiplier) {
      console.log(`  BR já tem parcelas: count=${count}, multiplier=${multiplier}`);
      continue;
    }

    await client.items.update(policy.id, {
      ...(needsCount ? { installment_count: 10 } : {}),
      ...(needsMultiplier ? { installment_multiplier: 1 } : {}),
    });
    try {
      await client.items.publish(policy.id);
    } catch {
      console.log(`  BR atualizado (publish skipped/unavailable)`);
      continue;
    }
    console.log(`  BR atualizado: installment_count=10, installment_multiplier=1`);
  }
}
