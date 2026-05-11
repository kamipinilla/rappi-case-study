export interface AverageTargetValuesGenerator {
  generate(average: number, count: number): number[]
}

export interface RandomNumberGenerator {
  next(): number
}

const defaultMaxRelativeDeviation = 0.1

export class SeededRandomNumberGenerator implements RandomNumberGenerator {
  private state: number

  constructor(seed: number) {
    if (!Number.isInteger(seed)) {
      throw new Error('Random seed must be an integer.')
    }

    this.state = seed >>> 0
  }

  next(): number {
    let value = (this.state += 0x6d2b79f5)
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function validateGenerationInputs(
  average: number,
  count: number,
  maxRelativeDeviation: number,
) {
  if (!Number.isFinite(average)) {
    throw new Error('Average must be finite.')
  }

  if (!Number.isInteger(count) || count < 0) {
    throw new Error('Count must be a non-negative integer.')
  }

  if (!Number.isFinite(maxRelativeDeviation) || maxRelativeDeviation < 0) {
    throw new Error('Max relative deviation must be a non-negative number.')
  }
}

function getMaxDeviation(
  average: number,
  maxRelativeDeviation: number,
): number {
  return Math.abs(average) * maxRelativeDeviation
}

export class ConstantAverageTargetValuesGenerator
  implements AverageTargetValuesGenerator
{
  generate(average: number, count: number): number[] {
    return Array.from({ length: count }, () => average)
  }
}

export class SymmetricRandomAverageTargetValuesGenerator
  implements AverageTargetValuesGenerator
{
  constructor(
    private readonly randomNumberGenerator: RandomNumberGenerator,
    private readonly maxRelativeDeviation = defaultMaxRelativeDeviation,
  ) {}

  generate(average: number, count: number): number[] {
    validateGenerationInputs(average, count, this.maxRelativeDeviation)

    if (count === 0) {
      return []
    }

    const maxDeviation = getMaxDeviation(average, this.maxRelativeDeviation)
    const values: number[] = []
    const pairCount = Math.floor(count / 2)

    for (let index = 0; index < pairCount; index += 1) {
      const deviation = this.randomNumberGenerator.next() * maxDeviation

      values.push(average + deviation, average - deviation)
    }

    if (count % 2 === 1) {
      values.push(average)
    }

    return this.shuffle(values)
  }

  private shuffle(values: number[]): number[] {
    const shuffledValues = [...values]

    for (let index = shuffledValues.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(
        this.randomNumberGenerator.next() * (index + 1),
      )
      const currentValue = shuffledValues[index]

      shuffledValues[index] = shuffledValues[swapIndex]
      shuffledValues[swapIndex] = currentValue
    }

    return shuffledValues
  }
}

export class CompensatedRandomAverageTargetValuesGenerator
  implements AverageTargetValuesGenerator
{
  constructor(
    private readonly randomNumberGenerator: RandomNumberGenerator,
    private readonly maxRelativeDeviation = defaultMaxRelativeDeviation,
  ) {}

  generate(average: number, count: number): number[] {
    validateGenerationInputs(average, count, this.maxRelativeDeviation)

    if (count === 0) {
      return []
    }

    const maxDeviation = getMaxDeviation(average, this.maxRelativeDeviation)
    const values: number[] = []
    let partialSum = 0

    for (let index = 0; index < count - 1; index += 1) {
      const deviation =
        (this.randomNumberGenerator.next() * 2 - 1) * maxDeviation
      const value = average + deviation

      values.push(value)
      partialSum += value
    }

    values.push(average * count - partialSum)

    return values
  }
}
