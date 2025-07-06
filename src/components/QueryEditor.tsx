import React from 'react';
import {
  InlineField,
  InlineFieldRow,
  Input,
  Button,
  SegmentAsync,
  Combobox,
  ComboboxOption,
  MultiCombobox
} from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from '../datasource';
import {
  MyDataSourceOptions,
  MyQuery,
  queryTypeOptions,
  panelTypeOptions,
  signozDataSourceOptions,
  aggregateOperatorOptions,
  AttributeKey,
  Having,
  OrderBy,
} from '../types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

const filterableFields = ['service.name', 'http.request.method', 'http.response.status_code'];
const groupByFields = ['service.name', 'http.request.method', 'http.response.status_code'];

const operatorOptions = [
  { label: '<', value: '<' },
  { label: '<=', value: '<=' },
  { label: '=', value: '=' },
  { label: '!=', value: '!=' },
  { label: '>', value: '>' },
  { label: '>=', value: '>=' },
  { label: 'IN', value: 'in' },
  { label: 'NOT_IN', value: 'not_in' },
  { label: 'CONTAINS', value: 'contains' },
  { label: 'NOT_CONTAINS', value: 'not_contains' },
  { label: 'EXISTS', value: 'exists' },
  { label: 'NOT_EXISTS', value: 'not_exists' },
  { label: 'REGEX', value: 'regex' },
  { label: 'NOT_REGEX', value: 'not_regex' },
];

export function QueryEditor({ query, onChange, datasource }: Props) {
  const { queryType, panelType, signozDataSource, filters = [], groupBy = [], aggregateOperator, aggregateAttribute, limit, having = [], orderBy = [] } = query;

  const loadOptionsFromAPI = async (queryText: string): Promise<Array<ComboboxOption<string>>> => {
    let res = (await datasource.makeSignozAttributeKeyAutocompleteRequest(queryText))
      .filter(f => f.toLowerCase().includes(queryText.toLowerCase()))
      .map(f => ({ label: f, value: f }));

    if (queryText) {
      res.push({ label: queryText + ": custom", value: queryText })
    }
    return res;
  };

  const loadHavingColumnOptions = async (queryText: string): Promise<Array<ComboboxOption<string>>> => {
    const options: Array<ComboboxOption<string>> = [];
    if (aggregateOperator) {
      options.push({ label: `#${aggregateOperator.toUpperCase()}`, value: `#SIGNOZ_VALUE` });
    }
    groupBy.forEach(g => {
      options.push({ label: g.key, value: g.key });
    });
    return options.filter(o => o.label?.toLowerCase().includes(queryText.toLowerCase()));
  };

  const loadFilterValueOptionsFromAPI = async (queryText: string, key: string): Promise<Array<ComboboxOption<string>>> => {
    // This function will fetch values based on the selected key
    // Simulate API call for now, will implement actual API call later
    let res = (await datasource.makeSignozAttributeValueAutocompleteRequest(key, queryText))
      .filter(f => f.toLowerCase().includes(queryText.toLowerCase()))
      .map(f => ({ label: f, value: f }));

    if (queryText) {
      res.unshift({ label: queryText + ": ?", value: queryText })
    }
    return res;
  };

  const addFilter = () => {
    onChange({ ...query, filters: [...filters, { key: '', value: '', operator: '=' }] });
  };

  const removeFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    onChange({ ...query, filters: newFilters });
  };

  const addHaving = () => {
    onChange({ ...query, having: [...having, { columnName: '', op: '>', value: '' }] });
  };

  const removeHaving = (index: number) => {
    const newHaving = having.filter((_, i) => i !== index);
    onChange({ ...query, having: newHaving });
  };

  const addOrderBy = () => {
    onChange({ ...query, orderBy: [...orderBy, { columnName: '', order: 'asc' }] });
  };

  const removeOrderBy = (index: number) => {
    const newOrderBy = orderBy.filter((_, i) => i !== index);
    onChange({ ...query, orderBy: newOrderBy });
  };

  const orderByOrderOptions = [
    { label: 'Ascending', value: 'asc' },
    { label: 'Descending', value: 'desc' },
  ];

  const havingOperatorOptions = [
    { label: '<', value: '<' },
    { label: '<=', value: '<=' },
    { label: '=', value: '=' },
    { label: '!=', value: '!=' },
    { label: '>', value: '>' },
    { label: '>=', value: '>=' },
  ];

  return (
    <div>
      <InlineFieldRow>
        <InlineField label="Data Source">
          <Combobox
            options={signozDataSourceOptions}
            value={signozDataSource}
            onChange={v => onChange({ ...query, signozDataSource: v.value! })}
          />
        </InlineField>

        <InlineField label="Query Type">
          <Combobox
            options={queryTypeOptions}
            value={queryType}
            onChange={v => onChange({ ...query, queryType: v.value! })}
          />
        </InlineField>

        <InlineField label="Panel Type">
          <Combobox
            options={panelTypeOptions}
            value={panelType}
            onChange={v => onChange({ ...query, panelType: v.value! })}
          />
        </InlineField>
      </InlineFieldRow>

      {filters.map((filter, index) => (
        <InlineFieldRow key={index}>
          <InlineField label="Filter">
            <Combobox
              options={(queryText) => loadOptionsFromAPI(queryText)}
              onChange={(selected: ComboboxOption<string> | null) => {
                const key = selected ? selected.value : '';
                const updated = [...filters];
                updated[index] = { ...filter, key };
                onChange({ ...query, filters: updated });
              }}
              value={filter.key}
              placeholder="Select field..."
            />
          </InlineField>

          <InlineField label="Operator">
            <Combobox
              options={operatorOptions}
              value={filter.operator}
              onChange={(v) => {
                const updated = [...filters];
                updated[index] = { ...filter, operator: v.value! };
                onChange({ ...query, filters: updated });
              }}
            />
          </InlineField>

          <InlineField label="Value" grow>
            <Combobox
              options={(queryText) => loadFilterValueOptionsFromAPI(queryText, filter.key)}
              onChange={(selected: ComboboxOption<string> | null) => {
                const value = selected ? selected.value : '';
                const updated = [...filters];
                updated[index] = { ...filter, value };
                onChange({ ...query, filters: updated });
              }}
              value={filter.value}
              placeholder="e.g. some-service"
            />
          </InlineField>

          <InlineField>
            <Button icon="trash-alt" variant="destructive" onClick={() => removeFilter(index)} />
          </InlineField>
        </InlineFieldRow>
      ))}

      <InlineFieldRow>
        <InlineField label="Filter">
          <Button icon="plus" onClick={addFilter}></Button>
        </InlineField>
      </InlineFieldRow>

      <InlineFieldRow>

        <InlineField label="Aggregate Operator">
          <Combobox
            options={aggregateOperatorOptions}
            value={aggregateOperator}
            onChange={v => onChange({ ...query, aggregateOperator: v.value! })}
          />
        </InlineField>

        <InlineField label="Aggregate Attribute" required={aggregateOperator !== 'count'}>
          <Combobox
            options={(queryText) => loadOptionsFromAPI(queryText)}
            onChange={(selected: ComboboxOption<string> | null) => {
              const key = selected ? selected.value : '';
              const newAttribute: AttributeKey = {
                key: key
              };
              onChange({ ...query, aggregateAttribute: newAttribute });
            }}
            value={aggregateAttribute?.key}
            placeholder="Select attribute..."
          />
        </InlineField>
      </InlineFieldRow>

      <InlineFieldRow>
        <InlineField label="Group By" grow>
          <MultiCombobox
            options={(queryText) => loadOptionsFromAPI(queryText)}
            value={groupBy.map(attr => ({ label: attr.key, value: attr.key }))}
            onChange={(selected: Array<ComboboxOption<string>>) => {
              const newGroupBy: AttributeKey[] = selected.map(s => ({
                key: s.value!,
                dataType: '',
                type: '',
                isColumn: false,
                isJSON: false,
                id: s.value!,
              }));
              onChange({ ...query, groupBy: newGroupBy });
            }}
            placeholder="Add group by"
          />
        </InlineField>
      </InlineFieldRow>

      <InlineFieldRow>
        <InlineField label="Limit">
          <Input
            type="number"
            value={limit}
            default={true}
            onChange={e => onChange({ ...query, limit: parseInt(e.currentTarget.value, 10) })}
            placeholder="e.g. 100"
          />
        </InlineField>
      </InlineFieldRow>

      {groupBy.length > 0 && (
        <>
          {having.map((h, index) => (
            <InlineFieldRow key={`having-${index}`}>
              <InlineField label="Having">
                <Combobox
                  options={(queryText) => loadHavingColumnOptions(queryText)}
                  onChange={(selected: ComboboxOption<string> | null) => {
                    const columnName = selected ? selected.value : '';
                    const updated = [...having];
                    updated[index] = { ...h, columnName };
                    onChange({ ...query, having: updated });
                  }}
                  value={h.columnName}
                  placeholder="Select column..."
                />
              </InlineField>

              <InlineField label="Operator">
                <Combobox
                  options={havingOperatorOptions}
                  value={h.op}
                  onChange={(v) => {
                    const updated = [...having];
                    updated[index] = { ...h, op: v.value! };
                    onChange({ ...query, having: updated });
                  }}
                />
              </InlineField>

              <InlineField label="Value" grow>
                <Input
                  value={h.value}
                  onChange={e => {
                    const updated = [...having];
                    updated[index] = { ...h, value: e.currentTarget.value };
                    onChange({ ...query, having: updated });
                  }}
                  placeholder="e.g. 100"
                />
              </InlineField>

              <InlineField>
                <Button icon="trash-alt" variant="destructive" onClick={() => removeHaving(index)} />
              </InlineField>
            </InlineFieldRow>
          ))}

          <InlineFieldRow>
            <InlineField label="Having">
              <Button icon="plus" onClick={addHaving}></Button>
            </InlineField>
          </InlineFieldRow>
        </>
      )}

      {orderBy.map((o, index) => (
        <InlineFieldRow key={`orderBy-${index}`}>
          <InlineField label="Order By Column">
            <Combobox
              options={(queryText) => loadHavingColumnOptions(queryText)}
              onChange={(selected: ComboboxOption<string> | null) => {
                const columnName = selected ? selected.value : '';
                const updated = [...orderBy];
                updated[index] = { ...o, columnName };
                onChange({ ...query, orderBy: updated });
              }}
              value={o.columnName}
              placeholder="Select column..."
            />
          </InlineField>

          <InlineField label="Order">
            <Combobox
              options={orderByOrderOptions}
              value={o.order}
              onChange={(v) => {
                const updated = [...orderBy];
                updated[index] = { ...o, order: v.value! };
                onChange({ ...query, orderBy: updated });
              }}
            />
          </InlineField>

          <InlineField>
            <Button icon="trash-alt" variant="destructive" onClick={() => removeOrderBy(index)} />
          </InlineField>
        </InlineFieldRow>
      ))}

      <InlineFieldRow>
        <InlineField label="Order By">
          <Button icon="plus" onClick={addOrderBy}></Button>
        </InlineField>
      </InlineFieldRow>
    </div>
  );
}
