import { BuilderCondition } from './BuilderCondition';

describe('BuilderCondition', () => {
  it('should generate an "include" condition for a single item', () => {
    const items = new Map<string, Set<string>>();
    items.set('stat:_eq', new Set(['HP']));
    const condition = BuilderCondition(items);
    expect(condition).toEqual(['STATLIST: { STATNAME: {_eq: "HP" } }']);
  });

  it('should generate an "exclude" condition for a single item', () => {
    const items = new Map<string, Set<string>>();
    items.set('stat:_neq', new Set(['HP']));
    const condition = BuilderCondition(items);
    expect(condition).toEqual(['STATLIST: { STATNAME: {_neq: "HP" } }']);
  });

  it('should generate "include" conditions for multiple items of the same kind', () => {
    const items = new Map<string, Set<string>>();
    items.set('stat:_eq', new Set(['HP', 'Attack']));
    const condition = BuilderCondition(items);
    expect(condition).toEqual(['STATLIST: { STATNAME: {_eq: "HP" } },STATLIST: { STATNAME: {_eq: "Attack" } }']);
  });

  it('should generate "exclude" conditions for multiple items of the same kind', () => {
    const items = new Map<string, Set<string>>();
    items.set('stat:_neq', new Set(['HP', 'Attack']));
    const condition = BuilderCondition(items);
    expect(condition).toEqual(['STATLIST: { STATNAME: {_neq: "HP" } },STATLIST: { STATNAME: {_neq: "Attack" } }']);
  });

  it('should generate "include" and "exclude" conditions for multiple items of different kinds', () => {
    const items = new Map<string, Set<string>>();
    items.set('stat:_eq', new Set(['HP']));
    items.set('measure:_neq', new Set(['Power']));
    const condition = BuilderCondition(items);
    expect(condition).toEqual([
      'STATLIST: { STATNAME: {_eq: "HP" } }',
      'TABLE_MEASUREs: { NAME: {_neq: "Power" } }',
    ]);
  });

  it('should return an empty array if no items are provided', () => {
    const items = new Map<string, Set<string>>();
    const condition = BuilderCondition(items);
    expect(condition).toEqual([]);
  });
});