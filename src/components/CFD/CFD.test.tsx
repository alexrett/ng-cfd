import React from "react";
import { render } from "@testing-library/react";

import CFD from "./CFD";
import fs from "fs";
import {TimeDatum} from "../../types/types";
import {parseCsvData} from "../../helpers/csv";
import {convert} from "../../helpers/convert";

enum TestLayer {
    todo = 'todo',
    doing = 'doing',
    done = 'done',
}

enum TestWipLayer {
    doing = 'doing',
}

describe("CFD", () => {
    let data: readonly TimeDatum<TestLayer>[]

    beforeEach(async () => {
        data = await parseCsvData<TestLayer>(fs.createReadStream(__dirname + '/../../data/test-cfd.csv', 'utf-8'))
    })

    test("renders the CFD component", () => {
        render(<CFD
            width={100}
            height={100}
            from={'doing' as TestLayer}
            to={'done' as TestLayer}
            data={convert<TestLayer>(data)}
            keys={Object.keys(TestLayer).reverse() as TestLayer[]}
            wipKeys={Object.keys(TestWipLayer).reverse() as TestLayer[]}
        />);
    });
});