import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import YahooFinance from 'yahoo-finance2';
import { formatToolResult } from '../types.js';

const yahooFinance = new YahooFinance();

/**
 * Yahoo Finance-backed financial statement tools.
 * Same tool names and output shapes as the Financial Datasets versions
 * so the existing formatters work unchanged.
 */

const FinancialStatementsInputSchema = z.object({
  ticker: z
    .string()
    .describe("The stock ticker symbol. For example, 'AAPL' for Apple."),
  period: z
    .enum(['annual', 'quarterly', 'ttm'])
    .describe("'annual' for yearly, 'quarterly' for quarterly, 'ttm' for trailing twelve months."),
  limit: z
    .number()
    .default(4)
    .describe('Maximum number of report periods to return (default: 4).'),
});

type IncomeRow = Record<string, unknown>;
type BalanceRow = Record<string, unknown>;
type CashFlowRow = Record<string, unknown>;

function mapIncomeStatement(row: IncomeRow): Record<string, unknown> {
  return {
    report_period: row.endDate ? new Date(row.endDate as string | number).toISOString().slice(0, 10) : undefined,
    revenue: row.totalRevenue,
    cost_of_revenue: row.costOfRevenue,
    gross_profit: row.grossProfit,
    operating_income: row.operatingIncome,
    net_income: row.netIncome ?? row.netIncomeApplicableToCommonShares,
    earnings_per_share: row.dilutedEPS ?? row.basicEPS,
    research_and_development: row.researchDevelopment,
    ebit: row.ebit,
    income_before_tax: row.incomeBeforeTax,
    income_tax_expense: row.incomeTaxExpense,
  };
}

function mapBalanceSheet(row: BalanceRow): Record<string, unknown> {
  return {
    report_period: row.endDate ? new Date(row.endDate as string | number).toISOString().slice(0, 10) : undefined,
    total_assets: row.totalAssets,
    total_liabilities: row.totalLiab ?? row.totalLiabilities,
    shareholders_equity: row.totalStockholderEquity ?? row.stockholdersEquity,
    cash_and_equivalents: row.cash ?? row.cashAndCashEquivalents,
    total_debt: row.longTermDebt,
    total_current_assets: row.totalCurrentAssets,
    total_current_liabilities: row.totalCurrentLiabilities,
  };
}

function mapCashFlow(row: CashFlowRow): Record<string, unknown> {
  return {
    report_period: row.endDate ? new Date(row.endDate as string | number).toISOString().slice(0, 10) : undefined,
    operating_cash_flow: row.totalCashFromOperatingActivities ?? row.operatingCashflow,
    capital_expenditure: row.capitalExpenditures ?? row.capitalExpenditure,
    net_cash_flow_from_investing: row.totalCashflowsFromInvestingActivities,
    net_cash_flow_from_financing: row.totalCashFromFinancingActivities,
    dividends_paid: row.dividendsPaid,
  };
}

function pickModule(period: string): 'incomeStatementHistory' | 'incomeStatementHistoryQuarterly' {
  return period === 'quarterly' || period === 'ttm'
    ? 'incomeStatementHistoryQuarterly'
    : 'incomeStatementHistory';
}

function pickBalanceModule(period: string): 'balanceSheetHistory' | 'balanceSheetHistoryQuarterly' {
  return period === 'quarterly' || period === 'ttm'
    ? 'balanceSheetHistoryQuarterly'
    : 'balanceSheetHistory';
}

function pickCashFlowModule(period: string): 'cashflowStatementHistory' | 'cashflowStatementHistoryQuarterly' {
  return period === 'quarterly' || period === 'ttm'
    ? 'cashflowStatementHistoryQuarterly'
    : 'cashflowStatementHistory';
}

const YF_URL = 'https://finance.yahoo.com/quote';

export const getIncomeStatements = new DynamicStructuredTool({
  name: 'get_income_statements',
  description: `Fetches a company's income statements (revenue, expenses, net income, EPS). Powered by Yahoo Finance.`,
  schema: FinancialStatementsInputSchema,
  func: async (input) => {
    const ticker = input.ticker.trim().toUpperCase();
    const mod = pickModule(input.period);
    const result = await yahooFinance.quoteSummary(ticker, { modules: [mod] });
    const statements = (result[mod]?.incomeStatementHistory ?? []) as unknown as IncomeRow[];
    const mapped = statements.slice(0, input.limit).map(mapIncomeStatement);
    return formatToolResult(mapped, [`${YF_URL}/${ticker}/financials`]);
  },
});

export const getBalanceSheets = new DynamicStructuredTool({
  name: 'get_balance_sheets',
  description: `Retrieves a company's balance sheets (assets, liabilities, equity). Powered by Yahoo Finance.`,
  schema: FinancialStatementsInputSchema,
  func: async (input) => {
    const ticker = input.ticker.trim().toUpperCase();
    const mod = pickBalanceModule(input.period);
    const result = await yahooFinance.quoteSummary(ticker, { modules: [mod] });
    const statements = (result[mod]?.balanceSheetStatements ?? []) as unknown as BalanceRow[];
    const mapped = statements.slice(0, input.limit).map(mapBalanceSheet);
    return formatToolResult(mapped, [`${YF_URL}/${ticker}/balance-sheet`]);
  },
});

export const getCashFlowStatements = new DynamicStructuredTool({
  name: 'get_cash_flow_statements',
  description: `Retrieves a company's cash flow statements (operating, investing, financing). Powered by Yahoo Finance.`,
  schema: FinancialStatementsInputSchema,
  func: async (input) => {
    const ticker = input.ticker.trim().toUpperCase();
    const mod = pickCashFlowModule(input.period);
    const result = await yahooFinance.quoteSummary(ticker, { modules: [mod] });
    const statements = (result[mod]?.cashflowStatements ?? []) as unknown as CashFlowRow[];
    const mapped = statements.slice(0, input.limit).map(mapCashFlow);
    return formatToolResult(mapped, [`${YF_URL}/${ticker}/cash-flow`]);
  },
});

export const getAllFinancialStatements = new DynamicStructuredTool({
  name: 'get_all_financial_statements',
  description: `Retrieves all three financial statements (income, balance sheet, cash flow) in a single call. Powered by Yahoo Finance.`,
  schema: FinancialStatementsInputSchema,
  func: async (input) => {
    const ticker = input.ticker.trim().toUpperCase();
    const incomeMod = pickModule(input.period);
    const balanceMod = pickBalanceModule(input.period);
    const cashFlowMod = pickCashFlowModule(input.period);

    const result = await yahooFinance.quoteSummary(ticker, {
      modules: [incomeMod, balanceMod, cashFlowMod],
    });

    const income = ((result[incomeMod]?.incomeStatementHistory ?? []) as unknown as IncomeRow[])
      .slice(0, input.limit).map(mapIncomeStatement);
    const balance = ((result[balanceMod]?.balanceSheetStatements ?? []) as unknown as BalanceRow[])
      .slice(0, input.limit).map(mapBalanceSheet);
    const cashFlow = ((result[cashFlowMod]?.cashflowStatements ?? []) as unknown as CashFlowRow[])
      .slice(0, input.limit).map(mapCashFlow);

    return formatToolResult(
      { income_statements: income, balance_sheets: balance, cash_flow_statements: cashFlow },
      [`${YF_URL}/${ticker}/financials`],
    );
  },
});
