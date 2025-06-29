export const results = {} as Record<
  string,
  Record<string, Record<string, { time: number; extra: boolean }>>
>;

export const suggests: Map<
  string, // 测试名称
  Map<
    string, // config字符串
    { method: string; time: number; ratio: number; extra: boolean }[]
  >
> = new Map();
