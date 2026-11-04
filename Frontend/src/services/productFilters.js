// Monetary bounds follow the backend's inclusive min/max comparisons.
const ranges = {
  all: {},
  under1m: { maxPrice: 999999.99 },
  '1to3m': { minPrice: 1000000, maxPrice: 3000000 },
  '3to5m': { minPrice: 3000000, maxPrice: 5000000 },
  under5: { maxPrice: 4999999.99 },
  under10: { maxPrice: 9999999.99 },
  '5to10': { minPrice: 5000000, maxPrice: 10000000 },
  '5to15': { minPrice: 5000000, maxPrice: 15000000 },
  '10to15': { minPrice: 10000000, maxPrice: 15000000 },
  '15to20': { minPrice: 15000000, maxPrice: 20000000 },
  '15to25': { minPrice: 15000000, maxPrice: 25000000 },
  '20to25': { minPrice: 20000000, maxPrice: 25000000 },
  '25to30': { minPrice: 25000000, maxPrice: 30000000 },
  above20: { minPrice: 20000000.01 },
  above25: { minPrice: 25000000.01 },
  above30: { minPrice: 30000000.01 },
};

export function priceBounds(range) {
  return { ...(Object.hasOwn(ranges, range) ? ranges[range] : ranges.all) };
}
