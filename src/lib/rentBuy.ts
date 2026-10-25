import { calculate, type Inputs } from './mortgage';

export interface RentBuyAssumptions {
  rent: number;
  tenantCosts: number;
  rentGrowth: number;
  homeGrowth: number;
  investmentReturn: number;
  costGrowth: number;
  sellingCost: number;
  years: number;
}
export const RENT_DEFAULTS: RentBuyAssumptions = {
  rent: 1500,
  tenantCosts: 250,
  rentGrowth: 2,
  homeGrowth: 1.5,
  investmentReturn: 4,
  costGrowth: 2,
  sellingCost: 3,
  years: 20,
};
export function rentVsBuy(inputs: Inputs, assumptions: RentBuyAssumptions) {
  const result = calculate(inputs);
  const a = { ...assumptions, years: Math.max(1, Math.min(40, Math.round(assumptions.years))) };
  let renterInvestments = result.cashUsed,
    buyerInvestments = 0;
  const monthlyReturn = Math.pow(1 + a.investmentReturn / 100, 1 / 12) - 1;
  const points = [];
  for (let month = 1; month <= a.years * 12; month++) {
    const row = result.schedule.rows[month - 1];
    const ownerCosts =
      (row?.payment ?? 0) +
      (row?.extra ?? 0) +
      (inputs.running + inputs.maintenance) * Math.pow(1 + a.costGrowth / 100, (month - 1) / 12);
    const renterCosts =
      a.rent * Math.pow(1 + a.rentGrowth / 100, (month - 1) / 12) +
      a.tenantCosts * Math.pow(1 + a.costGrowth / 100, (month - 1) / 12);
    renterInvestments =
      renterInvestments * (1 + monthlyReturn) + Math.max(0, ownerCosts - renterCosts);
    buyerInvestments =
      buyerInvestments * (1 + monthlyReturn) + Math.max(0, renterCosts - ownerCosts);
    if (month % 12 === 0) {
      const homeValue = inputs.price * Math.pow(1 + a.homeGrowth / 100, month / 12);
      const debt = row?.balance ?? result.schedule.remaining;
      const netHome = homeValue * (1 - a.sellingCost / 100) - debt;
      points.push({
        year: month / 12,
        homeValue,
        debt,
        netHome,
        buyerInvestments,
        renterInvestments,
        buyerWealth: netHome + buyerInvestments,
        renterWealth: renterInvestments,
      });
    }
  }
  return { points, end: points.at(-1)! };
}
