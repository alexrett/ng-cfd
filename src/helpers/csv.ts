import {TimeDatum} from "../types/types";
import Papa from "papaparse";

export function parseCsvData<Layer extends string | number>(
    input: string | File | NodeJS.ReadableStream
): Promise<readonly TimeDatum<Layer>[]> {
    return new Promise<readonly TimeDatum<Layer>[]>((resolve, reject) => {
        Papa.parse<TimeDatum<Layer>>(input, {
            header: true,
            dynamicTyping: true,
            transform(value: string | number, field: string) {
                return field === 'timestamp' ? new Date(value) : value
            },
            complete(results: { errors: string | any[]; data: readonly TimeDatum<Layer>[] | PromiseLike<readonly TimeDatum<Layer>[]>; }) {
                if (results.errors.length > 0) return reject(results.errors[0])
                resolve(results.data)
            },
        })
    })
}