/** Single point for heatmap: intensity 0.08–0.98 (higher = safer/blue, lower = less safe/red). */
export interface HeatmapFeature {
  type: "Feature"
  geometry: { type: "Point"; coordinates: [number, number] }
  properties: { intensity: number }
}

export interface HeatmapGeoJSON {
  type: "FeatureCollection"
  features: HeatmapFeature[]
}

const DEFAULT_CENTER = { lat: 17.4485, lng: 78.3908 }

/** Seeded RNG for reproducible random layout. */
function createRng(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

/** Randomise size, shape and positions; ~80% of area covered, ~20% uncovered. */
export function generateHeatmapGeoJSON(
  center: { lat: number; lng: number } = DEFAULT_CENTER,
  options: { gridSize?: number; coverFraction?: number } = {}
): HeatmapGeoJSON {
  const { gridSize = 10, coverFraction = 0.6 } = options
  const features: HeatmapFeature[] = []
  const extent = 0.022
  const cellSize = (2 * extent) / gridSize
  const rng = createRng(12345)

  /** Shuffle array (Fisher–Yates) using rng. */
  function shuffle<T>(arr: T[]): T[] {
    const out = arr.slice()
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]]
    }
    return out
  }

  const totalCells = gridSize * gridSize
  const coveredCount = Math.round(totalCells * coverFraction)
  const indices = Array.from({ length: totalCells }, (_, i) => i)
  const coveredIndices = new Set(shuffle(indices).slice(0, coveredCount))

  for (let gi = 0; gi < gridSize; gi++) {
    for (let gj = 0; gj < gridSize; gj++) {
      const idx = gi * gridSize + gj
      if (!coveredIndices.has(idx)) continue

      const cellMinLng = center.lng - extent + gj * cellSize
      const cellMinLat = center.lat - extent + gi * cellSize
      const cellMidLng = cellMinLng + cellSize / 2
      const cellMidLat = cellMinLat + cellSize / 2

      const shape = rng()
      const pointCount = 5 + Math.floor(rng() * 36)
      const spread = cellSize * (0.2 + rng() * 0.5)
      const baseIntensity = 0.08 + rng() * 0.9

      for (let p = 0; p < pointCount; p++) {
        let lng: number, lat: number
        if (shape < 0.25) {
          const angle = rng() * 2 * Math.PI
          const r = spread * Math.sqrt(rng())
          lng = cellMidLng + r * Math.cos(angle)
          lat = cellMidLat + r * Math.sin(angle)
        } else if (shape < 0.5) {
          const t = rng()
          const along = rng() > 0.5
          lng = cellMinLng + (along ? t * cellSize : rng() * cellSize)
          lat = cellMinLat + (along ? rng() * cellSize : t * cellSize)
        } else if (shape < 0.75) {
          const steps = 3 + Math.floor(rng() * 4)
          let x = 0, y = 0
          for (let s = 0; s < steps; s++) {
            const dir = Math.floor(rng() * 4)
            if (dir === 0) x += (rng() - 0.3) * spread
            else if (dir === 1) x -= (rng() - 0.3) * spread
            else if (dir === 2) y += (rng() - 0.3) * spread
            else y -= (rng() - 0.3) * spread
          }
          lng = cellMidLng + x
          lat = cellMidLat + y
        } else {
          lng = cellMinLng + rng() * cellSize
          lat = cellMinLat + rng() * cellSize
        }

        const intensity = Math.max(0.08, Math.min(0.98, baseIntensity + (rng() - 0.5) * 0.4))
        features.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: [lng, lat] },
          properties: { intensity },
        })
      }
    }
  }

  return { type: "FeatureCollection", features }
}

export const HEATMAP_GEOJSON = generateHeatmapGeoJSON()
