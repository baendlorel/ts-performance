export const results = {} as Record<
  string,
  Record<
    string,
    Record<string, { time: number; extra: boolean; config: Record<string, number | string> }>
  >
>;

export const suggests: Map<
  string, // 测试名称
  Map<
    string, // config字符串
    {
      approach: string;
      time: number;
      ratio: number;
      extra: boolean;
      config: Record<string, number | string>;
    }[]
  >
> = new Map();
