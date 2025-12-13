import { z } from 'zod';

/**
 * AI 格式提取器 - 从混乱的文本中提取 JSON
 */
export class AIFormatExtractor<T> {
  constructor(private schema: z.ZodSchema<T>) {}

  /**
   * 多策略提取 JSON
   */
  extract(rawText: string): any | null {
    const strategies = [
      this.extractPureJSON,
      this.extractCodeBlock,
      this.extractFirstObject,
      this.extractLastObject,
      this.extractByMarkers,
      this.extractMultiline,
      this.extractArray
    ];

    for (const strategy of strategies) {
      try {
        const extracted = strategy.call(this, rawText);
        if (extracted !== null) {
          // 尝试验证，如果验证成功则返回
          try {
            this.schema.parse(extracted);
            return extracted;
          } catch {
            // 继续尝试其他策略
            continue;
          }
        }
      } catch (error) {
        continue;
      }
    }

    // 如果所有策略都失败，返回第一个能解析的 JSON
    for (const strategy of strategies) {
      try {
        const extracted = strategy.call(this, rawText);
        if (extracted !== null) {
          return extracted;
        }
      } catch {
        continue;
      }
    }

    return null;
  }

  /**
   * 策略1: 直接解析整个文本
   */
  private extractPureJSON(text: string): any {
    const trimmed = text.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return JSON.parse(trimmed);
    }
    return null;
  }

  /**
   * 策略2: 提取代码块
   */
  private extractCodeBlock(text: string): any {
    const patterns = [
      /```json\s*([\s\S]*?)\s*```/,
      /```\s*([\s\S]*?)\s*```/,
      /`([^`]+)`/
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          return JSON.parse(match[1].trim());
        } catch {
          continue;
        }
      }
    }
    return null;
  }

  /**
   * 策略3: 提取第一个完整的 JSON 对象
   */
  private extractFirstObject(text: string): any {
    let depth = 0;
    let start = -1;
    
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (text[i] === '}') {
        depth--;
        if (depth === 0 && start !== -1) {
          try {
            return JSON.parse(text.substring(start, i + 1));
          } catch {
            start = -1;
          }
        }
      }
    }
    return null;
  }

  /**
   * 策略4: 提取最后一个 JSON 对象
   */
  private extractLastObject(text: string): any {
    const matches: any[] = [];
    let depth = 0;
    let start = -1;
    
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (text[i] === '}') {
        depth--;
        if (depth === 0 && start !== -1) {
          try {
            const obj = JSON.parse(text.substring(start, i + 1));
            matches.push(obj);
          } catch {
            // 继续
          }
          start = -1;
        }
      }
    }
    
    return matches.length > 0 ? matches[matches.length - 1] : null;
  }

  /**
   * 策略5: 通过标记提取
   */
  private extractByMarkers(text: string): any {
    const patterns = [
      /\[JSON_START\]([\s\S]*?)\[JSON_END\]/,
      /\[START\]([\s\S]*?)\[END\]/,
      /<json>([\s\S]*?)<\/json>/,
      /JSON:\s*(\{[\s\S]*?\})/
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          return JSON.parse(match[1].trim());
        } catch {
          continue;
        }
      }
    }
    return null;
  }

  /**
   * 策略6: 多行 JSON 提取
   */
  private extractMultiline(text: string): any {
    const lines = text.split('\n');
    let jsonLines: string[] = [];
    let inJson = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        inJson = true;
        jsonLines = [line];
      } else if (inJson) {
        jsonLines.push(line);
        if (trimmed.endsWith('}') || trimmed.endsWith(']')) {
          try {
            return JSON.parse(jsonLines.join('\n'));
          } catch {
            inJson = false;
            jsonLines = [];
          }
        }
      }
    }
    return null;
  }

  /**
   * 策略7: 提取 JSON 数组
   */
  private extractArray(text: string): any {
    let depth = 0;
    let start = -1;
    
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '[') {
        if (depth === 0) start = i;
        depth++;
      } else if (text[i] === ']') {
        depth--;
        if (depth === 0 && start !== -1) {
          try {
            return JSON.parse(text.substring(start, i + 1));
          } catch {
            start = -1;
          }
        }
      }
    }
    return null;
  }
}

/**
 * AI 格式补全器 - 补全缺失的字段
 */
export class AIFormatCompleter<T> {
  constructor(
    private schema: z.ZodSchema<T>,
    private defaultValues: Partial<T> = {}
  ) {}

  /**
   * 补全缺失字段
   */
  complete(partialData: any): T {
    try {
      // 先尝试直接验证
      return this.schema.parse(partialData);
    } catch (error: any) {
      // 提取验证失败的信息
      const completed = JSON.parse(JSON.stringify(partialData || {}));

      // 应用预设的默认值
      this.applyDefaults(completed, this.defaultValues);

      // 如果还是失败，尝试填充空值
      try {
        return this.schema.parse(completed);
      } catch (error2: any) {
        if (error2.issues) {
          for (const issue of error2.issues) {
            const path = issue.path;
            const value = this.getDefaultValueForType(issue);
            this.setNestedValue(completed, path, value);
          }
        }
        return this.schema.parse(completed);
      }
    }
  }

  private applyDefaults(target: any, defaults: any): void {
    for (const key in defaults) {
      if (!(key in target) || target[key] === undefined || target[key] === null) {
        target[key] = defaults[key];
      } else if (typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        this.applyDefaults(target[key], defaults[key]);
      }
    }
  }

  private getDefaultValueForType(issue: any): any {
    const expectedType = issue.expected;
    
    if (expectedType === 'string') return '';
    if (expectedType === 'number') return 0;
    if (expectedType === 'boolean') return false;
    if (expectedType === 'array') return [];
    if (expectedType === 'object') return {};
    
    return null;
  }

  private setNestedValue(obj: any, path: any[], value: any): void {
    if (path.length === 0) return;
    
    const key = path[0];
    if (path.length === 1) {
      if (!(key in obj) || obj[key] === undefined || obj[key] === null) {
        obj[key] = value;
      }
    } else {
      if (!obj[key] || typeof obj[key] !== 'object') {
        obj[key] = {};
      }
      this.setNestedValue(obj[key], path.slice(1), value);
    }
  }
}

/**
 * AI 格式处理器 - 组合提取、补全、验证
 */
export class AIFormatProcessor<T> {
  private extractor: AIFormatExtractor<T>;
  private completer: AIFormatCompleter<T>;
  private schema: z.ZodSchema<T>;
  private formatInstruction: string;

  constructor(
    schema: z.ZodSchema<T>,
    defaultValues: Partial<T> = {},
    formatInstruction?: string
  ) {
    this.schema = schema;
    this.extractor = new AIFormatExtractor(schema);
    this.completer = new AIFormatCompleter(schema, defaultValues);
    this.formatInstruction = formatInstruction || this.generateFormatInstruction();
  }

  /**
   * 生成格式指令
   */
  private generateFormatInstruction(): string {
    return `
【重要】你必须严格按照 JSON 格式输出，不要添加任何解释文字。

输出格式要求:
1. 只输出纯 JSON，不要使用 markdown 代码块
2. 不要有任何前缀或后缀说明
3. 确保 JSON 格式正确，所有字段完整

示例格式: {"field1":"value1","field2":"value2"}
`.trim();
  }

  /**
   * 获取格式指令（用于添加到 prompt）
   */
  getFormatInstruction(): string {
    return this.formatInstruction;
  }

  /**
   * 处理 AI 响应: 提取 → 补全 → 验证
   */
  process(rawResponse: string): T {
    // 1. 提取 JSON
    const extracted = this.extractor.extract(rawResponse);
    
    if (extracted === null) {
      throw new Error('无法从响应中提取有效的 JSON 数据');
    }

    // 2. 补全缺失字段
    const completed = this.completer.complete(extracted);

    // 3. 最终验证
    return this.schema.parse(completed);
  }

  /**
   * 带重试的处理
   */
  async processWithRetry(
    generateFn: (attempt: number) => Promise<string>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await generateFn(i);
        return this.process(response);
      } catch (error: any) {
        lastError = error;
        console.warn(`[AIFormatProcessor] 处理失败 (尝试 ${i + 1}/${maxRetries}):`, error.message);
      }
    }

    throw new Error(`AI 响应格式处理失败，已重试 ${maxRetries} 次: ${lastError?.message}`);
  }
}

/**
 * 创建快捷处理器
 */
export function createFormatProcessor<T>(
  schema: z.ZodSchema<T>,
  defaultValues?: Partial<T>,
  formatInstruction?: string
): AIFormatProcessor<T> {
  return new AIFormatProcessor(schema, defaultValues, formatInstruction);
}