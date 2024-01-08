import * as d3 from 'd3'
import {TimeDatum} from "../types/types";

export default function lt<Layer extends string>(
    timestamp: Date,
    from: Layer,
    to: Layer,
    keys: readonly Layer[],
    data: readonly TimeDatum<Layer>[],
    linear: boolean,
    adjust: (millis: number) => number
): number | undefined {
    const stack = d3.stack<TimeDatum<Layer>>().keys(keys)
    const series = stack(data)

    const layer = series.find((l) => l.key === from)
    if (layer === undefined) throw new Error(`Could not find ${from} in series: ${JSON.stringify(series)}`)

    const endLayer = series.find((l) => l.key === to)
    if (endLayer === undefined) throw new Error(`Could not find ${to} in series: ${JSON.stringify(series)}`)
    // Find the start point from timestamp
    const start = layer.find((point) => point.data.timestamp === timestamp)!
    const finish = endLayer.find((point) => point.data.timestamp === timestamp)!
    // The threshold is the UPPER value
    const threshold = start[1]
    if (threshold === 0) {
        return undefined
    }

    // Find the first following point whose LOWER value is greater or equal to the threshold
    const end = [...endLayer].find(
        (point) => {
            return point.data.timestamp.getTime() >= finish.data.timestamp.getTime() && point[1] >= threshold
        }
    )

    if (end === undefined) {
        return undefined
    }
    const discreteLt = end.data.timestamp.getTime() - start.data.timestamp.getTime()
    if (linear) {
        const beforeEnd = endLayer[endLayer.indexOf(end) - 1]
        const beforeY = end[1] - beforeEnd[1]
        const startY = end[1] - start[1]
        const fraction = startY === 0 ? 0 : startY / beforeY
        const dx = fraction * (end.data.timestamp.getTime() - beforeEnd.data.timestamp.getTime())
        const linearLt = discreteLt - dx
        return adjust(linearLt)
    }
    return adjust(discreteLt)
}
