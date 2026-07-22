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
  
  return parseFloat(plan.monthly_price) * duration;
};

export const getSavingsPercentage = (plan, duration) => {
  if (!plan) return 0;
  
  const originalPrice = parseFloat(plan.monthly_price) * duration;
  const newPrice = getDurationPrice(plan, duration);
  
  if (originalPrice <= newPrice) return 0;
  
  return Math.round(((originalPrice - newPrice) / originalPrice) * 100);
};
