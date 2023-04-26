import type { Product } from "@prisma/client";

const BUSINESS_PRODUCT = "prod_NEinkf0b6aRimr";
const ENTERPRISE_PRODUCT = "prod_NEinywn6ESejNp";

export type Feature = "example_business_feature" | "example_enterprise_feature";

/**
 * This is a mapping from stripe product ids to the features they unlock.
 * The keys are in the order of increasingly powerful products.
 * ex: Free/Basic ($0) -> Business ($20) -> Enterprise ($30)
 * ex: All the features unlocked by Business are also automatically unlocked by Enterprise.
 */
const FEATURE_UNLOCKS_BY_PRODUCT: Record<string, Feature[]> = {
  [BUSINESS_PRODUCT]: ["example_business_feature"],
  [ENTERPRISE_PRODUCT]: ["example_enterprise_feature"],
};

const SORTED_PRODUCT_IDS = Object.keys(FEATURE_UNLOCKS_BY_PRODUCT);

export const ALL_FEATURES = Object.values(FEATURE_UNLOCKS_BY_PRODUCT).flat();

/**
 * hasAccess checks if a subscription has access to a feature.
 * This assumes that subscriptions on the SORTED_PRODUCT_IDS list
 * have access to all features unlocked by previous products.
 */
export default function hasAccess(
  product: Product | null,
  feature: Feature
): boolean {
  if (product === null) {
    return false;
  }

  const productIndex = SORTED_PRODUCT_IDS.indexOf(product.id);
  if (productIndex === -1) {
    console.error(`Product ${product.id} is not in the list of products`);
    return false;
  }

  const relevantFeatures = Object.values(FEATURE_UNLOCKS_BY_PRODUCT)
    .slice(0, productIndex + 1)
    .flatMap((x) => x);

  return relevantFeatures.includes(feature);
}
