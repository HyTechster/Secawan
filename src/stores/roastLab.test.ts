import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mixStops, notesByRoast, useRoastLabStore } from './roastLab'

describe('roast lab store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('clamps and rounds the level', () => {
    const lab = useRoastLabStore()
    lab.setLevel(-20)
    expect(lab.level).toBe(0)
    lab.setLevel(140)
    expect(lab.level).toBe(100)
    lab.setLevel(42.6)
    expect(lab.level).toBe(43)
  })

  it('names the roast by thirds', () => {
    const lab = useRoastLabStore()
    lab.setLevel(10)
    expect(lab.roastName).toBe('Light')
    lab.setLevel(50)
    expect(lab.roastName).toBe('Medium')
    lab.setLevel(90)
    expect(lab.roastName).toBe('Dark')
  })

  it('derives notes and brew recommendation from the roast', () => {
    const lab = useRoastLabStore()
    lab.setLevel(95)
    expect(lab.notes).toEqual(notesByRoast.Dark)
    expect(lab.recommendedBrew).toMatch(/Moka/)
  })

  it('moves acidity down and bitterness up as the roast darkens', () => {
    const lab = useRoastLabStore()
    lab.setLevel(0)
    const light = { ...lab.profile }
    lab.setLevel(100)
    const dark = { ...lab.profile }
    expect(light.acidity).toBeGreaterThan(dark.acidity)
    expect(light.bitterness).toBeLessThan(dark.bitterness)
    expect(dark.body).toBeGreaterThan(light.body)
  })

  it('peaks sweetness around a medium roast', () => {
    const lab = useRoastLabStore()
    lab.setLevel(50)
    const medium = lab.profile.sweetness
    lab.setLevel(0)
    expect(medium).toBeGreaterThan(lab.profile.sweetness)
    lab.setLevel(100)
    expect(medium).toBeGreaterThan(lab.profile.sweetness)
  })

  it('flips text color at the midpoint', () => {
    const lab = useRoastLabStore()
    lab.setLevel(49)
    expect(lab.textColor).toBe('#2B1B14')
    lab.setLevel(50)
    expect(lab.textColor).toBe('#F6F0E6')
  })

  it('adds gloss and removes roughness as oils surface', () => {
    const lab = useRoastLabStore()
    lab.setLevel(10)
    const light = { r: lab.beanRoughness, c: lab.beanClearcoat }
    lab.setLevel(90)
    expect(lab.beanRoughness).toBeLessThan(light.r)
    expect(lab.beanClearcoat).toBeGreaterThan(light.c)
  })
})

describe('mixStops', () => {
  it('returns the end colors at the edges and blends between them', () => {
    const stops: Array<[number, string]> = [
      [0, '#000000'],
      [100, '#ffffff'],
    ]
    expect(mixStops(stops, 0)).toBe('#000000')
    expect(mixStops(stops, 100)).toBe('#ffffff')
    expect(mixStops(stops, 50)).toBe('#808080')
  })
})
