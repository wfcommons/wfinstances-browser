import React from 'react';
import Chart from '~/components/chart'; // Adjust the path based on your project structure

export function SimulateChart() {
    const options = {
        chart: {
            id: 'basic-bar',
        },
        xaxis: {
            categories: [1991, 1992, 1993, 1994, 1995],
        },
    };

    const series = [
        {
            name: 'Series 1',
            data: [30, 40, 45, 50, 49],
        },
    ];

    return (
        <div>
            <h1>My Chart</h1>
            <Chart options={options} series={series} type="bar" height="350" />
        </div>
    );
}

