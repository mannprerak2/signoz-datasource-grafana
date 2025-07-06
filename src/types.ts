import { DataSourceJsonData } from '@grafana/data';
import { DataQuery } from '@grafana/schema';

export interface Filter {
  key: string;
  operator: string;
  value: string;
}

export interface Having {
  columnName: string;
  op: string;
  value: string;
}

export interface OrderBy {
  columnName: string;
  order: string;
}

export interface AttributeKey {
  key: string;
}

export interface MyQuery extends DataQuery {
  queryType?: string;
  panelType?: string;
  signozDataSource: string;
  filters?: Filter[];
  groupBy?: AttributeKey[];
  aggregateOperator?: string;
  aggregateAttribute?: AttributeKey;
  limit?: number;
  having?: Having[];
  orderBy?: OrderBy[];
}

export const DEFAULT_QUERY: Partial<MyQuery> = {
  queryType: 'builder',
  panelType: 'graph',
  signozDataSource: 'traces',
  aggregateOperator: 'count',
  aggregateAttribute: {
    key: ''
  },
  limit: 0,
  having: [],
  orderBy: [],
};

export const queryTypeOptions = [
  { value: 'builder', label: 'Builder' },
  // { value: 'clickhouse_sql', label: 'ClickHouse SQL' },
  // { value: 'promql', label: 'PromQL' },
];

export const panelTypeOptions = [
  { value: 'graph', label: 'Graph' },
  // { value: 'table', label: 'Table' },
  // { value: 'value_list', label: 'Value List' },
  // { value: 'trace', label: 'Trace' },
];

export const signozDataSourceOptions = [
  { value: 'traces', label: 'Traces' },
  // { value: 'metrics', label: 'Metrics' },
  // { value: 'logs', label: 'Logs' },
];

export const aggregateOperatorOptions = [
  { value: 'count', label: 'Count' },
  { value: 'count_distinct', label: 'Count Distinct' },
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Avg' },
  { value: 'max', label: 'Max' },
  { value: 'min', label: 'Min' },
  { value: 'p05', label: 'P05' },
  { value: 'p10', label: 'P10' },
  { value: 'p25', label: 'P25' },
  { value: 'p50', label: 'P50' },
  { value: 'p75', label: 'P75' },
  { value: 'p90', label: 'P90' },
  { value: 'p95', label: 'P95' },
  { value: 'p99', label: 'P99' },
  { value: 'rate', label: 'Rate' },
  { value: 'rate_sum', label: 'Rate Sum' },
  { value: 'rate_avg', label: 'Rate Avg' },
  { value: 'rate_min', label: 'Rate Min' },
  { value: 'rate_max', label: 'Rate Max' }
];

export interface DataPoint {
  Time: number;
  Value: number;
}

export interface DataSourceResponse {
  datapoints: DataPoint[];
}

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  signozUrl?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  apiKey?: string;
}
