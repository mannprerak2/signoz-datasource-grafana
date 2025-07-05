import React, { ChangeEvent } from 'react';
import { InlineField, Input, Stack, Select, Combobox } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery, queryTypeOptions, panelTypeOptions } from '../types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {

  const onQueryTypeChange = (option: any) => {
    onChange({ ...query, queryType: option.value });
  };

  const onPanelTypeChange = (option: any) => {
    onChange({ ...query, panelType: option.value });
  };

  const { queryType, panelType } = query;

  return (
    <Stack gap={0}>
      <InlineField label="Query Type">
        <Combobox
          options={queryTypeOptions}
          value={queryType}
          onChange={onQueryTypeChange}
        />
      </InlineField>
      <InlineField label="Panel Type">
        <Combobox
          options={panelTypeOptions}
          value={panelType}
          onChange={onPanelTypeChange}
        />
      </InlineField>
    </Stack>
  );
}
