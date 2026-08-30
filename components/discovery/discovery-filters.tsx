import { SlidersHorizontal } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import type {
  AccessType,
  CommunityCategory,
  PlayerLevel,
  Region,
} from '@/lib/communities';
import type { DiscoveryFilters as DiscoveryFilterValues } from '@/lib/discovery';

const regions: Region[] = [
  'Central',
  'East',
  'West',
  'North',
  'North-East',
  'Islandwide',
];
const categories: CommunityCategory[] = [
  'Public programme',
  'Competitive community',
  'Alumni community',
  'Private club',
  'Social group',
  'Coaching academy',
];
const accessTypes: AccessType[] = [
  'Public',
  'Eligibility-based',
  'Members',
  'Guests welcome',
];
const levels: PlayerLevel[] = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Competitive',
];

export function DiscoveryFilters({
  filters,
  filtersActive,
  onFilterChange,
  onReset,
}: {
  filters: DiscoveryFilterValues;
  filtersActive: boolean;
  onFilterChange: <Key extends keyof DiscoveryFilterValues>(
    key: Key,
    value: DiscoveryFilterValues[Key],
  ) => void;
  onReset: () => void;
}) {
  return (
    <aside
      className="lg:sticky lg:top-24 lg:h-fit"
      aria-label="Community filters"
    >
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <SlidersHorizontal className="size-4 text-primary" /> Filters
          </div>
          {filtersActive && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Reset
            </button>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <FilterSelect
            label="Region"
            value={filters.region}
            onChange={(value) => onFilterChange('region', value)}
            options={regions}
          />
          <FilterSelect
            label="Community type"
            value={filters.category}
            onChange={(value) => onFilterChange('category', value)}
            options={categories}
          />
          <FilterSelect
            label="Access"
            value={filters.access}
            onChange={(value) => onFilterChange('access', value)}
            options={accessTypes}
          />
          <FilterSelect
            label="Playing level"
            value={filters.level}
            onChange={(value) => onFilterChange('level', value)}
            options={levels}
          />
          <div className="flex items-start gap-3 rounded-xl bg-muted/55 p-3 text-sm">
            <Checkbox
              id="training-only"
              aria-labelledby="training-only-label"
              checked={filters.trainingOnly}
              onCheckedChange={(checked) =>
                onFilterChange('trainingOnly', checked === true)
              }
              className="mt-0.5"
            />
            <label
              id="training-only-label"
              htmlFor="training-only"
              className="cursor-pointer"
            >
              <span className="block font-medium">Structured training</span>
              <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                Show communities with coaching or regular training.
              </span>
            </label>
          </div>
        </div>
      </div>
    </aside>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}) {
  const id = `filter-${label.toLowerCase().replaceAll(' ', '-')}`;

  return (
    <div className="grid gap-1.5 text-sm font-medium">
      <label htmlFor={id}>{label}</label>
      <NativeSelect
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full"
      >
        <NativeSelectOption value="">
          All {label.toLowerCase()}
        </NativeSelectOption>
        {options.map((option) => (
          <NativeSelectOption key={option} value={option}>
            {option}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}
