// A configuration is purchasable only through a real, published server SKU.
// Reference prices never override the server's checkout price.
export function resolveProductOptions(metadata, product, products = []) {
  const entry = metadata?.entries?.[product.slug];
  const family = entry && metadata.families?.[entry.family];
  if (!family) return null;
  const bySlug = new Map(products.map(item => [item.slug, item]));
  bySlug.set(product.slug, product);
  return {
    ...family,
    referenceDate: metadata.referenceDate,
    options: family.options.map(option => ({
      ...option,
      product: bySlug.get(option.slug) || null,
    })),
    initialSlug: entry.option || family.options.find(option => option.slug === product.slug)?.slug || family.options[0]?.slug || '',
  };
}

export function optionPurchase(option) {
  const product = option?.product;
  if (!product || !Number.isInteger(product.id) || product.id < 1
    || product.status !== 'PUBLISHED' || !Number.isFinite(product.price) || product.price <= 0
    || !Number.isInteger(product.stock) || product.stock < 1) return null;
  return product;
}

export function versionChoices(options) {
  return [...new Set(options.map(option => option.version))].map(version => {
    const choices = options.filter(option => option.version === version);
    const live = choices.filter(option => option.product);
    return { version, options: choices, price: Math.min(...(live.length ? live.map(option => option.product.price) : choices.map(option => option.referencePrice))), available: live.length > 0 };
  });
}

export function chooseVersion(options, version, previous) {
  const choices = options.filter(option => option.version === version);
  return choices.find(option => option.color === previous?.color && option.product)
    || choices.find(option => optionPurchase(option)) || choices[0] || null;
}
