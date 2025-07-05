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
} from '../types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

const filterableFields = ['service.name', 'http.request.method', 'http.response.status_code'];
const groupByFields = ['service.name', 'http.request.method', 'http.response.status_code'];

const operatorOptions = [
  { label: '=', value: '=' },
  { label: '!=', value: '!=' },
  { label: '<', value: '<' },
  { label: '<=', value: '<=' },
  { label: '>', value: '>' },
  { label: '>=', value: '>=' },
];

export function QueryEditor({ query, onChange, datasource }: Props) {
  const { queryType, panelType, signozDataSource, filters = [], groupBy = [] } = query;

  const loadOptionsFromAPI = async (queryText: string, sourceFields: string[]): Promise<Array<ComboboxOption<string>>> => {
    // Simulate API call
    let res = (await datasource.makeSignozAttributeKeyAutocompleteRequest(queryText))
      .filter(f => f.toLowerCase().includes(queryText.toLowerCase()))
      .map(f => ({ label: f, value: f }));

    if (queryText) {
      res.push({ label: queryText + ": custom", value: queryText })
    }
    return res;
  };

  const loadFilterValueOptionsFromAPI = async (queryText: string, key: string): Promise<Array<ComboboxOption<string>>> => {
    // This function will fetch values based on the selected key
    // Simulate API call for now, will implement actual API call later
    let res = (await datasource.makeSignozAttributeValueAutocompleteRequest(key, queryText))
      .filter(f => f.toLowerCase().includes(queryText.toLowerCase()))
      .map(f => ({ label: f, value: f }));

    if (queryText) {
      res.push({ label: queryText + ": custom", value: queryText })
    }
    return res;
  };

  const updateFilter = (index: number, key: string, value: string, operator: string) => {
    const newFilters = [...filters];
    newFilters[index] = { key, value, operator };
    onChange({ ...query, filters: newFilters });
  };

  const addFilter = () => {
    onChange({ ...query, filters: [...filters, { key: '', value: '', operator: '' }] });
  };

  const removeFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    onChange({ ...query, filters: newFilters });
  };

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

      {/* <InlineFieldRow>
        <InlineField label="Filters" />
      </InlineFieldRow> */}

      {filters.map((filter, index) => (
        <InlineFieldRow key={index}>
          <InlineField label="Filter">
            <Combobox
              options={(queryText) => loadOptionsFromAPI(queryText, filterableFields)}
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
        <InlineField label="Group By" grow>
          <MultiCombobox
            options={(queryText) => loadOptionsFromAPI(queryText, groupByFields)}
            value={groupBy.map(value => ({ label: value, value }))}
            onChange={(selected: Array<ComboboxOption<string>>) => {
              onChange({ ...query, groupBy: selected.map(s => s.value!) });
            }}
            placeholder="Add group by"
          />
        </InlineField>
      </InlineFieldRow>
    </div>
  );
}
