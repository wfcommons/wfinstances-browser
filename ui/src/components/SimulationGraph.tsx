// import React, { useEffect, useRef } from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export const SimulationGraph = ({ runtimeData, id }) => {
    // Sort the data by completion time
    runtimeData.sort((a, b) => a.completion_time - b.completion_time);
    
    // Initialize cumulative data with (0,0) point
    const cumulativeData = [{ completion_time: 0, cumulative_tasks: 0, task_name: '' }];
    let cumulativeTasks = 0;

    // Iterate over sorted tasks and accumulate task completion data
    runtimeData.forEach(task => {
        cumulativeTasks++;
        cumulativeData.push({
            completion_time: task.completion_time,
            cumulative_tasks: cumulativeTasks,
            task_name: task.task_name // Include task_name in cumulativeData
        });
    });

    const maxCompletionTime = Math.max(...runtimeData.map(task => task.completion_time));
    const xAxisMax = maxCompletionTime;

    // Prepare chart data
    const data = {
        datasets: [
            {
                label: 'Completed Tasks (Points)',
                data: cumulativeData.map(item => ({
                    x: item.completion_time,
                    y: item.cumulative_tasks
                })),
                backgroundColor: 'rgba(75, 192, 192, 1)',
                pointRadius: 5,
                showLine: false
            },
            {
                label: 'Task completions',
                data: cumulativeData.map(item => ({
                    x: item.completion_time,
                    y: item.cumulative_tasks
                })),
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                showLine: true,
                stepped: 'before'
            }
        ]
    };

    // Configure the chart options with dynamic x-axis max
    const options = {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time (in seconds)'
                },
                min: 0,
                max: xAxisMax,  
                ticks: {
                    stepSize: 50,
                    callback: function(value: number) {
                        return value.toFixed(2);
                    }
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Number of Completed Tasks'
                },
                beginAtZero: true
            }
        },
        plugins: {
            legend: {
                labels: {
                    filter: function(item) {
                        return item.text !== 'Completed Tasks (Points)';
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(tooltipItem) {
                        if (tooltipItem.dataset.label === 'Stepped Line') {
                            const task = cumulativeData[tooltipItem.dataIndex];
                            return `Task: ${task.task_name}, Completed Tasks: ${tooltipItem.raw.y} at Time: ${task.completion_time.toFixed(2)}s`;
                        }
                        return null;
                    }
                }
            }
        }
    };

  return (
    <div style={{ alignItems: 'center', justifyContent: 'center', width: '80%', height: '100%' }}>
      <h3 style={{ textAlign: 'center' }}>Task completion times</h3>
      <div>
        <Scatter data={data} options={options} />
      </div>
    </div>
  );
};
