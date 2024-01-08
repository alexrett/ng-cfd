import React from "react";
import CFD, {CFDProps} from "./CFD";

export default {
    title: "ng-cfd/CFD",
    component: CFD,
};

export const InitialCFD = (args: React.JSX.IntrinsicAttributes & CFDProps) => <CFD {...args} />;
InitialCFD.args = {
    label: "Here will be the CFD diagram!",
};
