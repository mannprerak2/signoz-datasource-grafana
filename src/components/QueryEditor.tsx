import React from 'react';
import {
  InlineField,
  InlineFieldRow,
  Input,
  Button,
  SegmentAsync,
  Combobox
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

const filterableFields = ['serviceName', 'operationName', 'statusCode', 'httpMethod'];

const operatorOptions = [
  { label: '=', value: '=' },
  { label: '!=', value: '!=' },
  { label: '<', value: '<' },
  { label: '<=', value: '<=' },
  { label: '>', value: '>' },
  { label: '>=', value: '>=' },
];

export function QueryEditor({ query, onChange }: Props) {
  const { queryType, panelType, signozDataSource, filters = [], groupBy = [] } = query;

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

  const addGroupBy = (segment: SelectableValue<string>) => {
    if (segment.value && !groupBy.includes(segment.value)) {
      onChange({ ...query, groupBy: [...groupBy, segment.value] });
    }
  };

  const removeGroupBy = (index: number) => {
    const newGroupBy = groupBy.filter((_, i) => i !== index);
    onChange({ ...query, groupBy: newGroupBy });
  };

  const loadGroupByOptions = async (): Promise<Array<SelectableValue<string>>> => {
    // Simulate async load (replace with real API call)
    await new Promise(resolve => setTimeout(resolve, 500));
    // TODO
    return Promise.resolve(
      ['serviceName', 'operationName', 'statusCode'].map(f => ({
        label: f,
        value: f,
      }))
    );
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
            <SegmentAsync
              loadOptions={async () =>
                Promise.resolve(filterableFields.map(f => ({ label: f, value: f })))
              }
              onChange={(selected) => {
                const key = selected.value as string;
                const updated = [...filters];
                updated[index] = { ...filter, key };
                onChange({ ...query, filters: updated });
              }}
              value={filter.key ? { label: filter.key, value: filter.key } : undefined}
              placeholder="Select field..."
              allowCustomValue={true}
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
            <Input
              value={filter.value}
              onChange={(e) => {
                const updated = [...filters];
                updated[index] = { ...filter, value: e.currentTarget.value };
                onChange({ ...query, filters: updated });
              }}
              placeholder="e.g. frontend"
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
        <InlineField label="Group By">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {groupBy.map((key, i) => (
              <Button
                key={i}
                variant="secondary"
                icon="times"
                onClick={() => removeGroupBy(i)}
              >
                {key}
              </Button>
            ))}
            <SegmentAsync
              loadOptions={loadGroupByOptions}
              onChange={addGroupBy}
              placeholder="Add group by"
              allowCustomValue={true}
            />
          </div>
        </InlineField>
      </InlineFieldRow>
    </div>
  );
}
