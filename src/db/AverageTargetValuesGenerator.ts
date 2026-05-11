export interface AverageTargetValuesGenerator {
  generate(average: number, count: number): number[]
}

export class ConstantAverageTargetValuesGenerator
  implements AverageTargetValuesGenerator
{
  generate(average: number, count: number): number[] {
    return Array.from({ length: count }, () => average)
  }
}
