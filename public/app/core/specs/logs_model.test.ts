import { calculateLogsLabelStats, dedupLogRows, LogsDedupStrategy, LogsModel } from '../logs_model';

describe('dedupLogRows()', () => {
  test('should return rows as is when dedup is set to none', () => {
    const logs = {
      rows: [
        {
          entry: 'WARN test 1.23 on [xxx]',
        },
        {
          entry: 'WARN test 1.23 on [xxx]',
        },
      ],
    };
    expect(dedupLogRows(logs as LogsModel, LogsDedupStrategy.none).rows).toMatchObject(logs.rows);
  });

  test('should dedup on exact matches', () => {
    const logs = {
      rows: [
        {
          entry: 'WARN test 1.23 on [xxx]',
        },
        {
          entry: 'WARN test 1.23 on [xxx]',
        },
        {
          entry: 'INFO test 2.44 on [xxx]',
        },
        {
          entry: 'WARN test 1.23 on [xxx]',
        },
      ],
    };
    expect(dedupLogRows(logs as LogsModel, LogsDedupStrategy.exact).rows).toEqual([
      {
        duplicates: 1,
        entry: 'WARN test 1.23 on [xxx]',
      },
      {
        duplicates: 0,
        entry: 'INFO test 2.44 on [xxx]',
      },
      {
        duplicates: 0,
        entry: 'WARN test 1.23 on [xxx]',
      },
    ]);
  });

  test('should dedup on number matches', () => {
    const logs = {
      rows: [
        {
          entry: 'WARN test 1.2323423 on [xxx]',
        },
        {
          entry: 'WARN test 1.23 on [xxx]',
        },
        {
          entry: 'INFO test 2.44 on [xxx]',
        },
        {
          entry: 'WARN test 1.23 on [xxx]',
        },
      ],
    };
    expect(dedupLogRows(logs as LogsModel, LogsDedupStrategy.numbers).rows).toEqual([
      {
        duplicates: 1,
        entry: 'WARN test 1.2323423 on [xxx]',
      },
      {
        duplicates: 0,
        entry: 'INFO test 2.44 on [xxx]',
      },
      {
        duplicates: 0,
        entry: 'WARN test 1.23 on [xxx]',
      },
    ]);
  });

  test('should dedup on signature matches', () => {
    const logs = {
      rows: [
        {
          entry: 'WARN test 1.2323423 on [xxx]',
        },
        {
          entry: 'WARN test 1.23 on [xxx]',
        },
        {
          entry: 'INFO test 2.44 on [xxx]',
        },
        {
          entry: 'WARN test 1.23 on [xxx]',
        },
      ],
    };
    expect(dedupLogRows(logs as LogsModel, LogsDedupStrategy.signature).rows).toEqual([
      {
        duplicates: 3,
        entry: 'WARN test 1.2323423 on [xxx]',
      },
    ]);
  });
});

describe('calculateLogsLabelStats()', () => {
  test('should return no stats for empty rows', () => {
    expect(calculateLogsLabelStats([], '')).toEqual([]);
  });

  test('should return no stats of label is not found', () => {
    const rows = [
      {
        entry: 'foo 1',
        labels: {
          foo: 'bar',
        },
      },
    ];

    expect(calculateLogsLabelStats(rows as any, 'baz')).toEqual([]);
  });

  test('should return stats for found labels', () => {
    const rows = [
      {
        entry: 'foo 1',
        labels: {
          foo: 'bar',
        },
      },
      {
        entry: 'foo 0',
        labels: {
          foo: 'xxx',
        },
      },
      {
        entry: 'foo 2',
        labels: {
          foo: 'bar',
        },
      },
    ];

    expect(calculateLogsLabelStats(rows as any, 'foo')).toMatchObject([
      {
        value: 'bar',
        count: 2,
      },
      {
        value: 'xxx',
        count: 1,
      },
    ]);
  });
});
