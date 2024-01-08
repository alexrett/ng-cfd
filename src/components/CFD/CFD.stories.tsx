import React from "react";
import CFD, {CFDProps} from "./CFD";
// @ts-ignore
import bekk from '../../data/bekk-cfd.csv'
// @ts-ignore
import test from '../../data/test-cfd.csv'
import {convert} from "../../helpers/convert";

export default {
    title: "ng-cfd/CFD",
    component: CFD,
};

enum BekkLayers {
    Backlog = 'Backlog',
    Specify = 'Specify',
    Develop = 'Develop',
    QA = 'QA',
    Approved = 'Approved',
    Deployed = 'Deployed',
}
enum BekkWipsLayers {
    Specify = 'Specify',
    Develop = 'Develop',
    QA = 'QA',
    Approved = 'Approved',
}

export const InitialCFD = (args: React.JSX.IntrinsicAttributes & CFDProps<any>) => <CFD {...args} />;
InitialCFD.args = {
    width: 1200,
    height: 600,
    data: convert<BekkLayers>(bekk),
    keys: Object.keys(BekkLayers).reverse() as BekkLayers[],
    wipKeys: Object.keys(BekkWipsLayers).reverse() as BekkLayers[]
};

enum TestLayer {
    todo = 'todo',
    doing = 'doing',
    done = 'done',
}

enum TestWipLayer {
    doing = 'doing',
}

export const TestCFD = (args: React.JSX.IntrinsicAttributes & CFDProps<any>) => <CFD {...args} />;
TestCFD.args = {
    width: 1200,
    height: 600,
    data: convert<TestLayer>(test),
    keys: Object.keys(TestLayer).reverse() as TestLayer[],
    wipKeys: Object.keys(TestWipLayer).reverse() as TestLayer[]
};