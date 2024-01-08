import React, {PropsWithChildren, useEffect, useRef} from "react";
import * as d3 from 'd3'
import {BaseTimeDatum, TimeDatum} from "../../types/types";
import toLt from "../../helpers/toLt";

export interface CFDProps<Layer extends string> {
    width: number;
    height: number;
    from: Layer;
    to: Layer;
    data: readonly TimeDatum<Layer>[]
    keys: readonly Layer[]
    wipKeys: readonly Layer[]
}

const bisectDate = d3.bisector((d: BaseTimeDatum) => d.timestamp).left
const margin = {top: 20, right: 30, bottom: 30, left: 40}

const CFD = <Layer extends string>(props: PropsWithChildren<CFDProps<Layer>>) => {
    const {
        data,
        keys,
        wipKeys,
        width,
        height,
        from,
        to,
    } = props
    const ltData = toLt(data, keys, true, from, to)
    const d3Container = useRef(null)

    useEffect(() => {
        if (d3Container.current) {
            const svg = d3.select(d3Container.current)
            const width = +svg.attr('width') - margin.left - margin.right
            const height = +svg.attr('height') - margin.top - margin.bottom

            const color = d3
                .scaleOrdinal()
                .domain(keys)
                .range(d3.schemeSet3)

            const stackGen = d3.stack<TimeDatum<Layer>>().keys(keys)
            const series = stackGen(data)
            const xScale = d3
                .scaleUtc()
                .domain(d3.extent(data, (d) => d.timestamp) as [Date, Date])
                .range([margin.left, width - margin.right])

            const yScale = d3
                .scaleLinear()
                .domain([0, d3.max(series, (d) => d3.max(d, (d) => d[1])) as number])
                .nice()
                .range([height - margin.bottom, margin.top])

            const area = d3
                .area()
                // @ts-ignore
                .x((d) => xScale(d.data.timestamp))
                .y0((d) => yScale(d[0]))
                .y1((d) => yScale(d[1]))

            const xAxis = (g: d3.Selection<SVGGElement, unknown, HTMLElement, any>) =>
                g.attr('transform', `translate(0,${height - margin.bottom})`).call(
                    d3
                        .axisBottom(xScale)
                        .ticks(width / 80)
                        .tickSizeOuter(0)
                )

            const yAxis = (g: d3.Selection<SVGGElement, unknown, HTMLElement, any>) =>
                g.attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(yScale))

            svg
                .append('g')
                .selectAll('path')
                .data(series)
                .join('path')
                .attr('fill', ({key}) => color(key) as string)
                .attr('stroke', '#111401')
                // @ts-ignore
                .attr('d', area)
                .append('title')
                .text(({key}) => key)

            svg.append('g').call(xAxis)
            svg.append('g').call(yAxis)


            /////// Append hover elements
            const hoverContainer = svg.append('g').style('display', 'none')
            const datumCircles = series.map(() => hoverContainer.append('circle').attr('r', 4))
            const datumLabels = series.map(() => hoverContainer.append('text').attr('r', 4))
            const datumStackLabels = series.map(() => hoverContainer.append('text').attr('r', 4))
            const ltCircles = series.map(() => hoverContainer.append('circle').attr('r', 4))
            const ltLabels = series.map(() => hoverContainer.append('text').attr('r', 4))
            const ltLines = series.map(() =>
                hoverContainer
                    .append('line')
                    .attr('stroke', '#111401')
                    .attr('stroke-width', '2px')
                    .attr('stroke-dasharray', '3, 3')
                    .attr('x1', 0)
                    .attr('x2', 0)
                    .attr('y1', 0)
                    .attr('y2', 0)
            )

            const verticalLine = hoverContainer
                .append('line')
                .attr('stroke', '#111401')
                .attr('stroke-width', '2px')
                .attr('stroke-dasharray', '3, 3')
                .attr('x1', 0)
                .attr('x2', 0)
                .attr('y1', 0)
                .attr('y2', height)

            // Add transparent element that's only about capturing mouse events
            svg
                .append('rect')
                .attr('fill', 'none')
                .attr('pointer-events', 'all')
                .attr('width', width)
                .attr('height', height)
                .on('mouseover', () => hoverContainer.style('display', null))
                .on('mouseout', () => hoverContainer.style('display', 'none'))
                .on(
                    'mousemove',
                    (evt) => {
                        const pointer = d3.pointer(evt)
                        // Use the mouse's x-position to find the nearest data index
                        const x0 = xScale.invert(pointer[0])
                        const index = bisectDate(data, x0, 1)
                        const datumLeft = data[index - 1]
                        const datumRight = data[index]
                        // const d = (datumLeft.timestamp.getTime() - datumLeft.timestamp.getTime()) > (datumRight.timestamp.getTime() - datumLeft.timestamp.getTime()) ? datumRight : datumLeft
                        if (datumLeft === undefined || datumRight === undefined) return

                        const nearestIndex =
                            x0.getTime() - datumLeft.timestamp.getTime() > datumRight.timestamp.getTime() - x0.getTime()
                                ? index
                                : index - 1

                        const d = nearestIndex === index ? datumRight : datumLeft
                        // Move (transform) lines and circles
                        const ltDatum = ltData[nearestIndex]
                        const datumTimestamp = data[nearestIndex].timestamp
                        const datumX = xScale(datumTimestamp)

                        function calcStackLabel(d: BaseTimeDatum & Record<Layer, number>, key: string): string {
                            if (!wipKeys.includes(key as Layer)) {
                                return ""
                            }
                            let stackedValue = 0;
                            for (let i = 0; i < keys.length; i++) {
                                const k = keys[i];
                                if (!wipKeys.includes(k)) {
                                    continue
                                }
                                if (k === key) {
                                    stackedValue += d[k]
                                    return `WIP: ${stackedValue.toString()}`
                                }
                                stackedValue += d[k]
                            }
                            return `WIP: ${stackedValue.toString()}`
                        }

                        for (let di = 0; di < series.length; di++) {
                            const seriesDi = series[di]
                            const stackDatum = seriesDi[nearestIndex]

                            // The y coordinate is the top (y1) of the stack datum
                            const datumY = yScale(stackDatum[1])

                            // Move the datum circle
                            const datumCircle = datumCircles[di]
                            datumCircle.attr('transform', `translate(${datumX},${datumY})`)
                            const datumLabel = datumLabels[di]
                            const datumStackLabel = datumStackLabels[di]
                            datumLabel.attr('transform', `translate(${datumX + 5},${datumY + 15})`)
                                .text(d[seriesDi.key as Layer] + ' : ' + seriesDi.key)
                                .style('font-family', 'sans-serif')
                                .style('font-size', '10px')

                            if (wipKeys.includes(seriesDi.key as Layer) && di === series.length - 2) {
                                const v = calcStackLabel(d, seriesDi.key)
                                datumStackLabel.attr('transform', `translate(${datumX - 45},${datumY - 7})`)
                                    .text(v)
                                    .style('font-family', 'sans-serif')
                                    .style('font-size', '10px')
                                    .style('font-weight', 'bold')
                            }
                            // .style("fill", "#fff")
                            // @ts-ignore
                            const lt = ltDatum[seriesDi.key]
                            const ltCircle = ltCircles[di]
                            const ltLabel = ltLabels[di]
                            const ltLine = ltLines[di]
                            if (lt !== undefined && seriesDi.key === from) {
                                // Move (and show) the lt circle
                                ltCircle.style('display', null)
                                ltLabel.style('display', null)
                                const ltTimestamp = new Date(datumTimestamp.getTime() + lt)
                                const ltX = xScale(ltTimestamp)

                                let DifferenceInLtTime = ltTimestamp.getTime() - datumTimestamp.getTime();

                                // To calculate the no. of days between two dates
                                let DifferenceInDays =
                                    Math.round(DifferenceInLtTime / (1000 * 3600 * 24));

                                // console.log(DifferenceInDays)
                                ltCircle.attr('transform', `translate(${ltX},${datumY})`)
                                if (DifferenceInDays > 0) {
                                    ltLabel.attr('transform', `translate(${ltX - 3},${datumY - 7})`)
                                        .text('LT: ' + DifferenceInDays).style('font-family', 'sans-serif').style('font-size', '10px')
                                        .style('font-weight', 'bold')
                                }
                                // Move (and show) the lt line
                                ltLine.style('display', null)
                                ltLine.attr('x1', datumX).attr('x2', ltX).attr('y1', datumY).attr('y2', datumY)
                            } else {
                                ltCircle.style('display', 'none')
                                ltLine.style('display', 'none')
                                ltLabel.style('display', 'none')
                            }
                        }
                        verticalLine.attr('transform', `translate(${datumX},0)`)
                        // Set the text
                        // hoverContainer.select('text').text(() => d.values[1])
                    },
                    'mousemove'
                )
        }
    }, [data, keys])

    return <svg width={width} height={height} ref={d3Container}/>
};

export default CFD;