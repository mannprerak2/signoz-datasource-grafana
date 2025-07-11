import { getBackendSrv, isFetchError } from '@grafana/runtime';
import {
  CoreApp,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  createDataFrame,
  FieldType,
  DataFrame,
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions, DEFAULT_QUERY, Filter, AttributeKey, Having, OrderBy } from './types';
import { lastValueFrom } from 'rxjs';

import defaults from 'lodash/defaults';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  baseUrl: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.baseUrl = instanceSettings.url!;
  }

  getDefaultQuery(_: CoreApp): Partial<MyQuery> {
    return DEFAULT_QUERY;
  }

  filterQuery(query: MyQuery): boolean {
    // if no query has been provided, prevent the query from being executed
    return true;
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const { range } = options;
    const from = range!.from.valueOf();
    const to = range!.to.valueOf();

    const step = Math.max((options.intervalMs / 1000), 60)
    // Return a constant for each query.
    const finalDataFrames: DataFrame[] = []
    await Promise.all(
      options.targets.map(async (target) => {
        const query = defaults(target, DEFAULT_QUERY);

        const { queryType, panelType, signozDataSource, filters, groupBy, aggregateOperator, aggregateAttribute, limit, having, orderBy } = query;

        const response = await this.makeSignozGraphRequest({
          from: from,
          to: to,
          datasource: signozDataSource,
          queryType: queryType,
          panelType: panelType,
          aggregateOperator: aggregateOperator,
          aggregateAttribute: aggregateAttribute,
          groupBy: groupBy,
          filters: filters,
          limit: limit,
          having: having,
          orderBy: orderBy,
          step: step
        }) as any;

        const allSeries = response.data?.data?.result[0]?.series ?? []
        for (const rawSeries of allSeries) {
          let f = this.createDataFrameFromSeries(query, rawSeries);
          finalDataFrames.push(f);
        }
      }
      ));

    const data = finalDataFrames;
    return { data };
  }


  createDataFrameFromSeries(query: any, rawSeries: any) {
    const series = rawSeries?.values ?? [];
    const name = JSON.stringify(rawSeries.labels);
    const frame = createDataFrame({
      refId: query.refId,
      fields: [
        { name: 'time', type: FieldType.time },
        { name: name, type: FieldType.number },
      ],
    });
    series.sort((i1: any, i2: any) => i1['timestamp'] - i2['timestamp']);
    for (let v of series) {
      frame.fields[0].values!.push(v['timestamp']);
      frame.fields[1].values!.push(parseInt(v['value'], 10));
    }
    return frame;
  }

  async request(url: string, params?: string, method?: string, data?: any) {
    const response = getBackendSrv().fetch({
      url: `${this.baseUrl}${url}${params?.length ? `?${params}` : ''}`,
      method: method,
      data: data
    });
    return lastValueFrom(response);
  }

  /**
   * Checks whether we can connect to the API.
   */
  async testDatasource() {
    const defaultErrorMessage = 'Cannot connect to API';
    try {
      const response = await this.request("/signoz_api/api/v4/query_range", "", "POST", {
        "compositeQuery": {
          "queryType": "builder",
          "panelType": "graph",
          "fillGaps": false,
          "builderQueries": {
          }
        }
      })
      if (response.status === 200) {
        return {
          status: 'success',
          message: response.statusText,
        };
      } else {
        return {
          status: 'error',
          message: response.statusText ? response.statusText : defaultErrorMessage,
        };
      }
    } catch (err) {
      let message = '';
      if (typeof err === 'string') {
        message = err;
      } else if (isFetchError(err)) {
        message = 'Fetch error: ' + (err.statusText ? err.statusText : defaultErrorMessage);
        if (err.data && err.data.error && err.data.error.code) {
          message += ': ' + err.data.error.code + '. ' + err.data.error.message;
        }
      }
      return {
        status: 'error',
        message,
      };
    }
  }

  async makeSignozAttributeKeyAutocompleteRequest(searchText: string): Promise<string[]> {
    const res = []
    try {
      const response = await this.request("/signoz_api/api/v4/query_range?autocomplete=keys", "", "POST", {
        "compositeQuery": {
          "queryType": "clickhouse_sql",
          "panelType": "table",
          "fillGaps": false,
          "chQueries": {
            "A": {
              "name": "A",
              "legend": "",
              "disabled": false,
              "query": `SELECT * FROM signoz_traces.span_attributes_keys where tagKey ILIKE '%${searchText}%' limit 100;`
            }
          }
        }
      });
      res.push(...(response.data as any)?.data?.result[0]?.series?.map((i: any) => i?.labels.tagKey));
    } catch (err) {
      console.error(err);
    }

    // Hack: adding non tag fields
    const nonTagFields = [
      "span_id",
      "parent_span_id",
      "kind",
      "status_code_string",
      "response_status_code",
      "external_http_method",
      "trace_id",
      "trace_state",
      "flags",
      "name",
      "status_code",
      "http_method",
      "http_host",
      "db_name",
      "db_operation",
      "has_error",
      "kind_string",
      "external_http_url",
      "duration_nano",
      "status_message",
      "http_url",
      "is_remote"
    ];
    res.push(...nonTagFields);
    return res;
  }

  async makeSignozAttributeValueAutocompleteRequest(tagKey: string, searchText: string): Promise<string[]> {
    try {
      if (!tagKey) {
        return [];
      }
      const response = await this.request("/signoz_api/api/v4/query_range?autocomplete=values", "", "POST", {
        "compositeQuery": {
          "queryType": "clickhouse_sql",
          "panelType": "table",
          "fillGaps": false,
          "chQueries": {
            "A": {
              "name": "A",
              "legend": "",
              "disabled": false,
              "query": `SELECT * FROM signoz_traces.tag_attributes_v2 where tag_key = '${tagKey}' order by unix_milli desc limit 100;`
            }
          }
        }
      });
      return (response.data as any)?.data?.result[0]?.series?.map((i: any) => i?.labels.string_value) ?? [];
    } catch (err) {
      console.error(err);
      return []
    }
  }

  async makeSignozGraphRequest(
    data: {
      from: number
      to: number,
      datasource: string,
      queryType?: string,
      panelType?: string,
      step?: number,
      aggregateOperator?: string,
      aggregateAttribute?: AttributeKey,
      groupBy?: AttributeKey[],
      filters?: Filter[],
      limit?: number,
      having?: Having[],
      orderBy?: OrderBy[],
    }) {
    try {

      const requestData = {
        start: data.from,
        end: data.to,
        step: data.step ?? 60,
        variables: {},
        compositeQuery: {
          queryType: data.queryType ?? DEFAULT_QUERY.queryType,
          panelType: data.panelType ?? DEFAULT_QUERY.panelType,
          fillGaps: false,
          builderQueries: {
            A: {
              dataSource: data.datasource,
              queryName: 'A',
              expression: 'A',
              stepInterval: data.step ?? 60,
              aggregateOperator: data.aggregateOperator ?? "count",
              aggregateAttribute: data.aggregateAttribute ?? DEFAULT_QUERY.aggregateAttribute,
              timeAggregation: 'rate',
              spaceAggregation: 'sum',
              functions: [],
              filters: {
                op: 'AND',
                items: data.filters?.map((i) => {
                  // TODO: splitting based on comma
                  let value = (i.operator === "in" || i.operator === "not_in") ? i.value.split(",") : i.value;
                  return ({ key: { key: i.key }, op: i.operator, value: value });
                }),
              },
              disabled: false,
              having: data.having ?? [],
              limit: data.limit ?? null,
              orderBy: data.orderBy ?? [],
              groupBy: data.groupBy ?? [],
              legend: '',
              reduceTo: 'avg',
            },
          },
        }
      };

      return await this.request(
        '/signoz_api/api/v4/query_range',
        '',
        'POST',
        requestData
      );
    } catch (err) {
      console.error("Error in signoz request: " + err, err)
      return undefined;
    }
  }
}
