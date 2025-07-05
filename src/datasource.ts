import { getBackendSrv, isFetchError } from '@grafana/runtime';
import {
  CoreApp,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  createDataFrame,
  FieldType,
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions, DEFAULT_QUERY, queryTypeOptions } from './types';
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

    // Return a constant for each query.
    const data = await Promise.all(
      options.targets.map(async (target) => {
        const query = defaults(target, DEFAULT_QUERY);
        const frame = createDataFrame({
          refId: query.refId,
          fields: [
            { name: 'time', type: FieldType.time },
            { name: 'value', type: FieldType.number },
          ],
        });

        const { queryType, panelType, signozDataSource } = query;

        const response = await this.makeSignozRequest({
          from: from,
          to: to,
          datasource: signozDataSource,
          queryType: queryType,
          panelType: panelType,
          aggregateOperator: "count"
        }) as any;

        let rawData = response.data as any;
        const finalSeries = rawData?.data?.result[0]?.series[0]?.values;
        finalSeries.sort((i1: any, i2: any) => i1['timestamp'] - i2['timestamp']);
        for (let v of finalSeries) {
          frame.fields[0].values!.push(v['timestamp']);
          frame.fields[1].values!.push(parseInt(v['value'], 10));
        }

        return frame;
      }
      ));

    return { data };
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

  async makeSignozRequest(
    data: {
      from: number
      to: number,
      datasource: string,
      queryType?: string,
      panelType?: string,
      step?: number,
      aggregateOperator?: string,
      aggregateAttribute?: string
    })  {
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
              stepInterval: 60,
              aggregateOperator: data.aggregateOperator ?? "noop",
              aggregateAttribute: {
                    key: data.aggregateAttribute ?? ""
              },
              timeAggregation: 'rate',
              spaceAggregation: 'sum',
              functions: [],
              filters: {
                items: [],
                op: 'AND',
              },
              disabled: false,
              having: [],
              limit: null,
              orderBy: [
                {
                  columnName: 'timestamp',
                  order: 'desc',
                }
              ],
              groupBy: [],
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
