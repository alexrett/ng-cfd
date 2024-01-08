import {TimeDatum} from "../types/types";
import TestLayer from "../components/CFD/TestLayer";

export function convert<Layer extends string>(data: readonly TimeDatum<TestLayer>[]): ReadonlyArray<TimeDatum<Layer>> {
    return data.map((datum) => {
        return { ...datum, ...{ timestamp: new Date(datum.timestamp) } } as TimeDatum<Layer>
    })
}