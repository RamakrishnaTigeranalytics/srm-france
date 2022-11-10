import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import * as d3 from 'd3';
import  * as Utils from "@core/utils"
@Component({
    selector: 'nwn-cm-sc-chart',
    templateUrl: './compare-scenario-chart.component.html',
    styleUrls: ['./compare-scenario-chart.component.css'],
})
export class CompareScenarioChartComponent implements OnInit,OnChanges {
    @Input() cschartdata: any[];
    @Input() legenddata: any[];

    @Input()
    currency

    private svg: any;
    private margin = { top: 10, right: 0, bottom: 20, left: 60 };
    private boundingWidth = 1200 - this.margin.left - this.margin.right;
    private boundingHeight = 400 - this.margin.top - this.margin.bottom;
    constructor() {
        // Initialization inside the constructor
        this.cschartdata = [];
        this.legenddata = []
     }
    ngOnChanges(changes: SimpleChanges) {
        for (let property in changes) {
            if (property === 'cschartdata') {
                this.cschartdata = [];
              this.cschartdata = changes[property].currentValue
              this.legenddata = changes['legenddata'].currentValue
              this.margin = { top: 10, right: 0, bottom: 20, left: 60 };
              this.boundingWidth = 1200 - this.margin.left - this.margin.right;
              this.boundingHeight = 400 - this.margin.top - this.margin.bottom;
                this.createSvg()
                this.drawBars(this.cschartdata);
            }
        }
    }
    public ngOnInit(): void {
        this.createSvg();
        this.drawBars(this.cschartdata);
    }

    // private createSvg(): void {
    //     this.svg = d3
    //         .select('#marsCustomerMetricsCompare')
    //         .append('svg')
    //         // Wrapper
    //         .attr('width', this.boundingWidth + this.margin.left + this.margin.right)
    //         .attr('height', this.boundingHeight + this.margin.top + this.margin.bottom)
    //         // Bounds starting at 0X0 from margin left and top
    //         .append('g')
    //         .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
    // }
    private createSvg(): void {
        // debugger
        d3.select('#plChartSVGCompare').remove();
        this.svg = d3
            .select('#marsCustomerMetricsCompare')
            .append('svg').attr("id","plChartSVGCompare")
            // Wrapper
            .attr('width', this.boundingWidth + this.margin.left + this.margin.right)
            .attr('height', this.boundingHeight + this.margin.top + this.margin.bottom)
            // Bounds starting at 0X0 from margin left and top
            .append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    }

    private drawBars(data: any[]): void {

        function dollarFormat(d: any) {
            var num :any = d
            if(num == 0){
                num = 0
                return num
            }
            if(num.toString()[1] != undefined && num.toString()[1] == "0"){
                return (` ${curr}`+d3.format('.1s')(d) ).replace(/G/,"B")
            }
            return  (` ${curr}` + d3.format('.2s')(d)).replace(/G/,"B")
        };

        function dollarTooltip(d: any) {
            var num :any = d
            if(num == 0){
                num = 0
                return num
            }
            if(num.toString()[1] != undefined && num.toString()[1] == "0"){
                return (`${curr} `+ d.toFixed(2))
            }
            return  (`${curr} ` + d.toFixed(2))
        };
        var curr = "€"
        // console.log(data)

        const boundingHeight = this.boundingHeight;
        // Maxim value in the data to find the maximum bound dynamically
        const maximumValueInData = getMaxvalue();
        function getMaxvalue() {
            const maxBase = Math.max(...data.map((d) => d.base));
            let maxValue: any = [0];
            data.map((item) => {
                Object.values(item).map((re) => {
                    if (typeof re === 'number') {
                        maxValue.push(re);
                    }
                })
            })
            let maxSimulated = Math.max(...maxValue);
            return maxBase >= maxSimulated ? maxBase : maxSimulated;
        }

        // List of groups
        const groups = data.map((d) => d.group);

        // List of subgroups
        const subGroups:any = [];
        if(data.length > 0){
            for(let i = 0; i < data.length; i++){
                subGroups.push('simulated_'+JSON.stringify(i+1))
            }
        }

        // Add X Axis - Groups
        const xScale = d3.scaleBand().domain(groups).range([0, this.boundingWidth]).padding(0.2);
        const xAxisGenerator = d3.axisBottom(xScale);
        this.svg
            .append('g')
            .attr('class', 'xAxis')
            .attr('transform', `translate(0, ${this.boundingHeight})`)
            .call(xAxisGenerator)
            .call(d3.axisBottom(xScale).tickSizeOuter(0));

        // Add Y Axis - Dollar Value
        const yScale = d3
            .scaleLinear()
            .domain([0, maximumValueInData + maximumValueInData / 10])
            .range([this.boundingHeight, 0])
            // To make sure the axis starts and ends on round numbers
            .nice();
        const yAxisGenerator = d3.axisLeft(yScale);

        this.svg
            .append('g')
            .attr('class', 'yAxis')
            .call(yAxisGenerator)
            .call(d3.axisLeft(yScale).tickFormat(dollarFormat));

        // Another scale for subgroup position?
        const xSubgroup = d3
            .scaleBand()
            .domain(subGroups)
            .range([0, xScale.bandwidth()])
            .paddingInner(0.2)
            .paddingOuter(4.6);

        const legendColors = this.legenddata.map(value => value.color);


        // color palette = one color per subgroup
        const color = d3.scaleOrdinal().domain(subGroups).range(legendColors);
        // debugger
        // Show the bars
        this.svg
            .append('g')
            .selectAll('g')
            // Enter in data = loop group per group
            .data(data)
            .join('g')
            .attr('class', 'group')
            .attr('transform', (d: any) => `translate(${xScale(d.group)}, 0)`)
            .attr('groupType', (d: any) => `${d.group}`)
            .attr('mainX', (d: any) => `${xScale(d.group)}`)
            .selectAll('rect')
            .data(function (d: any) {
                return subGroups.map(function (key) {
                    return { key: key, value: d[key] };
                });
            })
            .join('rect')
            .attr('x', (d: any) => xSubgroup(d.key))
            .attr('y', (d: any) => yScale(d.value))
            .attr('width', xSubgroup.bandwidth())
            .attr('height', (d: any) => this.boundingHeight - yScale(d.value))
            .attr('fill', (d: any) => color(d.key))
            .on('mouseover', mouseover)
            .on('mouseleave', mouseleave);

        const chart = this.svg;
        // Event handlers
        function mouseover(datum: any, index: any, nodes: any) {
            // Get the bar's X and Y Co-ordinates & then augment for tooltip
            // const xPos = parseFloat(d3.select(datum.target).attr('y'));
            // const xGroupPos = xScale(d3.select(datum.target.parentNode).attr('groupType'));
            const xGroupPosition = parseFloat(d3.select(datum.target.parentNode).attr('mainX'));
            // const xSubGroupPos = xSubgroup(index.key);
            const xSubGroupPosition = parseFloat(d3.select(datum.target).attr('x'));
            const midPoint = xSubgroup.bandwidth() / 2;

            // Calculate optimal co-ordinates for Indicator
            const xPositionForIndicator = xGroupPosition + xSubGroupPosition + midPoint;

            // Calculate optimal co-ordinates for tooltip
            const xPositionForTooltip = xGroupPosition + xSubGroupPosition + midPoint - 60;
            const yPositionForTooltip = parseFloat(d3.select(datum.target).attr('y')) + 50;

            // Create a line
            chart
                .append('line')
                .attr('id', 'indicatorLine')
                .attr('x1', xPositionForIndicator)
                .attr('x2', xPositionForIndicator)
                .attr('y1', '0')
                .attr('y2', boundingHeight);

            // Create a blip
            chart
                .append('circle')
                .attr('id', 'indicatorBlip')
                .attr('cx', xPositionForIndicator)
                .attr('cy', parseFloat(d3.select(datum.target).attr('y')))
                .attr('r', '3')
                .attr('stroke', '#A1A1AA')
                .attr('stroke-width', '1')
                .attr('fill', '#E4E4E7');

            // Update the tooltip
            d3.select('#compare-chart-tooltip')
                .style('opacity', '1')
                .style('left', xPositionForTooltip + 'px')
                .style('bottom', 200 + 'px');
            d3.select('#compare-chart-tooltip').select('#base').text(
                Utils.formatPlain(index.value ,curr , false)
                // dollarTooltip(index.value)
                );
                //
            // dollarFormat(index.value)
            d3.select('#compare-chart-tooltip')
                .select('#baseColor')
                .style('background-color', d3.select(datum.target).attr('fill'));
            d3.select('#compare-chart-tooltip').select('#group').text(d3.select(datum.target.parentNode).attr('groupType'));
            // console.log(yScale(index.value));
            // const subgroupName = d3.select(this.parentNode).datum().key;
            // const subgroupValue = d.data[subgroupName];
            // tooltip.html('subgroup: ' + subgroupName + '<br>' + 'Value: ' + subgroupValue).style('opacity', 1);
        }

        function mouseleave(datum: any, index: any, nodes: any) {
            // Update the tooltip
            d3.select('#compare-chart-tooltip').style('opacity', '0');
            chart.selectAll('#indicatorLine').remove();
            chart.selectAll('#indicatorBlip').remove();
        }
    }
}
