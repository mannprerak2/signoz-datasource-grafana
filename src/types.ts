import { DataSourceJsonData } from '@grafana/data';
import { DataQuery } from '@grafana/schema';

export interface MyQuery extends DataQuery {
  queryType?: string;
  panelType?: string;
  signozDataSource: string;
  filters?: { key: string; operator: string; value: string }[];
  groupBy?: string[];
}

export const DEFAULT_QUERY: Partial<MyQuery> = {
  queryType: 'builder',
  panelType: 'graph',
  signozDataSource: 'traces',
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
  { value: 'metrics', label: 'Metrics' },
  { value: 'logs', label: 'Logs' },
];

export const aggregateOperatorOptions = [
  { value: 'noop', label: 'No Op' },
  { value: 'count', label: 'Count' },
  { value: 'p95', label: 'P95' },
  { value: 'avg', label: 'Avg' },
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
