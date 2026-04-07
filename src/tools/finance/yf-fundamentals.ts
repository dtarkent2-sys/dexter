import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import YahooFinance from 'yahoo-finance2';
import { formatToolResult } from '../types.js';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

/**
 * Yahoo Finance-backed financial statement tools.
 *
 * Uses fundamentalsTimeSeries (not the deprecated quoteSummary modules like
 * incomeStatementHistory/balanceSheetHistory/cashflowStatementHistory which
 * have returned mostly empty data since Nov 2024).
 *
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

type FTSRow = Record<string, unknown>;

function rowDate(row: FTSRow): string | undefined {
  const d = row.date;
  if (!d) return undefined;
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  if (typeof d === 'number') return new Date(d * 1000).toISOString().slice(0, 10);
  if (typeof d === 'string') return new Date(d).toISOString().slice(0, 10);
  return undefined;
}

function mapIncomeStatement(row: FTSRow): Record<string, unknown> {
  return {
    report_period: rowDate(row),
    revenue: row.totalRevenue,
    cost_of_revenue: row.costOfRevenue,
    gross_profit: row.grossProfit,
    operating_income: row.operatingIncome,
    net_income: row.netIncome ?? row.netIncomeCommonStockholders,
    earnings_per_share: row.dilutedEPS ?? row.basicEPS,
    research_and_development: row.researchAndDevelopment,
    selling_general_admin: row.sellingGeneralAndAdministration,
    operating_expense: row.operatingExpense,
    total_expenses: row.totalExpenses,
    ebit: row.EBIT,
    ebitda: row.EBITDA,
    income_before_tax: row.pretaxIncome,
    income_tax_expense: row.taxProvision,
    stock_based_compensation: row.stockBasedCompensation,
    basic_average_shares: row.basicAverageShares,
    diluted_average_shares: row.dilutedAverageShares,
  };
}

function mapBalanceSheet(row: FTSRow): Record<string, unknown> {
  return {
    report_period: rowDate(row),
    total_assets: row.totalAssets,
    total_liabilities: row.totalLiabilitiesNetMinorityInterest,
    shareholders_equity: row.stockholdersEquity,
    cash_and_equivalents: row.cashAndCashEquivalents,
    short_term_investments: row.otherShortTermInvestments,
    accounts_receivable: row.accountsReceivable,
    inventory: row.inventory,
    total_current_assets: row.currentAssets,
    net_ppe: row.netPPE,
    total_non_current_assets: row.totalNonCurrentAssets,
    accounts_payable: row.accountsPayable,
    current_debt: row.currentDebt,
    total_current_liabilities: row.currentLiabilities,
    long_term_debt: row.longTermDebt,
    total_debt: row.totalDebt,
    net_debt: row.netDebt,
    retained_earnings: row.retainedEarnings,
    common_stock_equity: row.commonStockEquity,
    shares_outstanding: row.ordinarySharesNumber,
    working_capital: row.workingCapital,
    tangible_book_value: row.tangibleBookValue,
    invested_capital: row.investedCapital,
  };
}

function mapCashFlow(row: FTSRow): Record<string, unknown> {
  return {
    report_period: rowDate(row),
    operating_cash_flow: row.operatingCashFlow,
    capital_expenditure: row.capitalExpenditure,
    free_cash_flow: row.freeCashFlow,
    depreciation_amortization: row.depreciationAndAmortization,
    change_in_working_capital: row.changeInWorkingCapital,
    net_cash_flow_from_investing: row.investingCashFlow,
    net_cash_flow_from_financing: row.financingCashFlow,
    dividends_paid: row.cashDividendsPaid,
    share_repurchases: row.repurchaseOfCapitalStock,
    net_debt_issuance: row.netIssuancePaymentsOfDebt,
    beginning_cash: row.beginningCashPosition,
    end_cash: row.endCashPosition,
  };
}

async function fetchFundamentals(ticker: string, period: string, limit: number): Promise<FTSRow[]> {
  const periodYears = period === 'annual' ? Math.max(limit, 5) : Math.ceil(limit / 4) + 1;
  const period1 = new Date(Date.now() - periodYears * 365 * 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 10);

  const rows = await yahooFinance.fundamentalsTimeSeries(ticker, {
    period1,
    period2: new Date().toISOString().slice(0, 10),
    type: period === 'annual' ? 'annual' : 'quarterly',
    module: 'all',
  }, { validateResult: false });

  if (!rows || rows.length === 0) return [];

  return rows
    .sort((a: FTSRow, b: FTSRow) => {
      const da = a.date instanceof Date ? a.date.getTime() : Number(a.date) * 1000;
      const db = b.date instanceof Date ? b.date.getTime() : Number(b.date) * 1000;
      return db - da;
    })
    .slice(0, limit);
}

const YF_URL = 'https://finance.yahoo.com/quote';

export const getIncomeStatements = new DynamicStructuredTool({
  name: 'get_income_statements',
  description: `Fetches a company's income statements (revenue, expenses, net income, EPS). Powered by Yahoo Finance.`,
  schema: FinancialStatementsInputSchema,
  func: async (input) => {
    const ticker = input.ticker.trim().toUpperCase();
    const rows = await fetchFundamentals(ticker, input.period, input.limit);
    const mapped = rows.map(mapIncomeStatement);
    return formatToolResult(mapped, [`${YF_URL}/${ticker}/financials`]);
  },
});

export const getBalanceSheets = new DynamicStructuredTool({
  name: 'get_balance_sheets',
  description: `Retrieves a company's balance sheets (assets, liabilities, equity). Powered by Yahoo Finance.`,
  schema: FinancialStatementsInputSchema,
  func: async (input) => {
    const ticker = input.ticker.trim().toUpperCase();
    const rows = await fetchFundamentals(ticker, input.period, input.limit);
    const mapped = rows.map(mapBalanceSheet);
    return formatToolResult(mapped, [`${YF_URL}/${ticker}/balance-sheet`]);
  },
});

export const getCashFlowStatements = new DynamicStructuredTool({
  name: 'get_cash_flow_statements',
  description: `Retrieves a company's cash flow statements (operating, investing, financing). Powered by Yahoo Finance.`,
  schema: FinancialStatementsInputSchema,
  func: async (input) => {
    const ticker = input.ticker.trim().toUpperCase();
    const rows = await fetchFundamentals(ticker, input.period, input.limit);
    const mapped = rows.map(mapCashFlow);
    return formatToolResult(mapped, [`${YF_URL}/${ticker}/cash-flow`]);
  },
});

export const getAllFinancialStatements = new DynamicStructuredTool({
  name: 'get_all_financial_statements',
  description: `Retrieves all three financial statements (income, balance sheet, cash flow) in a single call. Powered by Yahoo Finance.`,
  schema: FinancialStatementsInputSchema,
  func: async (input) => {
    const ticker = input.ticker.trim().toUpperCase();
    const rows = await fetchFundamentals(ticker, input.period, input.limit);
    return formatToolResult(
      {
        income_statements: rows.map(mapIncomeStatement),
        balance_sheets: rows.map(mapBalanceSheet),
        cash_flow_statements: rows.map(mapCashFlow),
      },
      [`${YF_URL}/${ticker}/financials`],
    );
  },
});
