import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { formatClock, useBrewTimerStore } from './brewTimer'

describe('brew timer store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('only ticks while running', () => {
    const timer = useBrewTimerStore()
    timer.tick(5)
    expect(timer.elapsed).toBe(0)
    timer.start()
    timer.tick(5)
    expect(timer.elapsed).toBe(5)
    timer.pause()
    timer.tick(5)
    expect(timer.elapsed).toBe(5)
  })

  it('highlights the current step', () => {
    const timer = useBrewTimerStore()
    timer.start()
    expect(timer.currentStepIndex).toBe(0)
    timer.tick(45)
    expect(timer.currentStepIndex).toBe(1)
    timer.tick(29)
    expect(timer.currentStepIndex).toBe(1)
    timer.tick(1)
    expect(timer.currentStepIndex).toBe(2)
  })

  it('stops at the end of the recipe', () => {
    const timer = useBrewTimerStore()
    timer.start()
    timer.tick(10_000)
    expect(timer.elapsed).toBe(timer.total)
    expect(timer.running).toBe(false)
    expect(timer.isDone).toBe(true)
    expect(timer.progress).toBe(1)
  })

  it('restarts from zero when started after finishing', () => {
    const timer = useBrewTimerStore()
    timer.start()
    timer.tick(10_000)
    timer.start()
    expect(timer.elapsed).toBe(0)
    expect(timer.running).toBe(true)
  })

  it('resets when switching method', () => {
    const timer = useBrewTimerStore()
    timer.start()
    timer.tick(30)
    timer.selectMethod('moka')
    expect(timer.elapsed).toBe(0)
    expect(timer.running).toBe(false)
    expect(timer.method.name).toBe('Moka Pot')
  })

  it('toggles and resets', () => {
    const timer = useBrewTimerStore()
    timer.toggle()
    expect(timer.running).toBe(true)
    timer.tick(12)
    timer.toggle()
    expect(timer.running).toBe(false)
    timer.reset()
    expect(timer.elapsed).toBe(0)
  })

  it('jumps to a step without changing play state, and clamps to the recipe', () => {
    const timer = useBrewTimerStore()
    timer.seek(80)
    expect(timer.elapsed).toBe(80)
    expect(timer.currentStepIndex).toBe(2)
    expect(timer.running).toBe(false)
    timer.start()
    timer.seek(-5)
    expect(timer.elapsed).toBe(0)
    expect(timer.running).toBe(true)
    timer.seek(10_000)
    expect(timer.isDone).toBe(true)
    expect(timer.running).toBe(false)
  })

  it('formats the clock', () => {
    expect(formatClock(0)).toBe('0:00')
    expect(formatClock(45)).toBe('0:45')
    expect(formatClock(165)).toBe('2:45')
  })
})
