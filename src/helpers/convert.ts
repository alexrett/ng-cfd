import {TimeDatum} from "../types/types";

export function convert<Layer extends string>(data: readonly TimeDatum<any>[]): ReadonlyArray<TimeDatum<Layer>> {
    return data.map((datum) => {
        return { ...datum, ...{ timestamp: new Date(datum.timestamp) } } as TimeDatum<Layer>
    })
}