import React from "react";

export interface CFDProps {
    label: string;
}

const CFD = (props: CFDProps) => {
    return <div>{props.label}</div>;
};

export default CFD;