export const getDurationPrice = (plan, duration) => {
  if (!plan) return 0;
  
  if (duration === 3 && plan.price_3_months) {
    return parseFloat(plan.price_3_months);
  }
  if (duration === 6 && plan.price_6_months) {
    return parseFloat(plan.price_6_months);
  }
  if (duration === 12 && plan.price_1_year) {
    return parseFloat(plan.price_1_year);
  }
  
  // Fallback to default discounts if admin hasn't set custom prices
  const basePrice = parseFloat(plan.monthly_price) * duration;
  if (duration === 3) return basePrice * 0.95; // 5% off
  if (duration === 6) return basePrice * 0.90; // 10% off
  if (duration === 12) return basePrice * 0.80; // 20% off
  
  return basePrice;
};

export const getSavingsPercentage = (plan, duration) => {
  if (!plan) return 0;
  
  const originalPrice = parseFloat(plan.monthly_price) * duration;
  const newPrice = getDurationPrice(plan, duration);
  
  if (originalPrice <= newPrice) return 0;
  
  return Math.round(((originalPrice - newPrice) / originalPrice) * 100);
};
