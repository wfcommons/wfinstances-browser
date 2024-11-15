import React, { useEffect, useState } from 'react';

export function SimulateChart() {
    const [Chart, setChart] = useState(null);
    const [options, setOptions] = useState({});
    const [series, setSeries] = useState([]);

    useEffect(() => {
    // Dynamically import the Chart component
        import('react-apexcharts').then((module) => {
            //console.log('Imported module:', module); // Debug the imported module
            setChart(() => module.Object);

            // Set your options and series after the chart is loaded
            setOptions({
                chart: {
                    id: 'basic-bar',
                },
                xaxis: {
                    categories: [1991, 1992, 1993, 1994, 1995],
                },
            });

            setSeries([
                {
                    name: 'Series 1',
                    data: [30, 40, 45, 50, 49],
                },
            ]);
        });
    }, []);

    if (!Chart) {
    // Optionally render a loading state while the Chart component is being loaded
        return <div>Loading Chart...</div>;
    }

    return <Chart options={options} series={series} type="bar" height="350" />;
}


