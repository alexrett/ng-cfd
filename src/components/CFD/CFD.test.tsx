import React from "react";
import { render } from "@testing-library/react";

import CFD from "./CFD";

describe("CFD", () => {
    test("renders the CFD component", () => {
        render(<CFD label="CFD will be here!" />);
    });
});