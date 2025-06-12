import { navigate } from "@utils/router.js";
import styles from "@screens/styles/dashboard.module.css";
import * as d3 from 'd3';
import { redirectIfNotLoggedIn } from "@utils/redirects.js";


/**
 * @typedef {Object} Chart
 * @property svg
 * @property {Object} data
 * @property {number} width
 * @property {number} height
 * @property {function} x
 * @property {function} y
 */

/**
 *
 * @returns {[function,string]}
 */
export default function () {
    redirectIfNotLoggedIn();
    const access_level = localStorage.getItem("access_level");

    if (access_level) {
        if (access_level !== "write") {
            navigate('menu');
        }
    }

    const getDim = (viewBox) => {
        const viewBoxComponents = viewBox.split(" ").map(Number);
        return [viewBoxComponents[2], viewBoxComponents[3]]
    }

    const fetchChartsData = () => {
        return [
            [
                { name: "A", value: 30 },
                { name: "B", value: 80 }
            ],
            Array.from({ length: 10 }, (_, i) => ({
                date: new Date(2023, 0, i + 1),
                value: Math.random() * 50 + 50
            })),
            Array.from({ length: 10 }, (_, i) => ({
                date: new Date(2023, 0, i + 1),
                value: Math.random() * 30 + 20
            })),
            Array.from({ length: 10 }, (_, i) => ({
                date: new Date(2023, 0, i + 1),
                value: Math.random() * 50 + 50
            })),
            Array.from({ length: 10 }, (_, i) => ({
                date: new Date(2023, 0, i + 1),
                value: Math.random() * 30 + 20
            }))
        ];
    }

    const innit = () => {
        document.getElementById("btn-home")?.addEventListener("click", () => navigate("menu"));
        document.getElementById("btn-logo")?.addEventListener("click", () => navigate("menu"));
        document.getElementById("btn-logout")?.addEventListener("click", () => {
            navigate("menu");
            window.alert("\"Logged out\"");
        });

        const margin = { top: 60, right: 0, bottom: 10, left: 0 };

        /** @type {Chart} */
        const chartBar = {};

        /** @type {Chart} */
        const chartGame = {};

        /** @type {Chart} */
        const chartMean = {};

        /** @type {Chart} */
        const chartKill = {};

        /** @type {Chart} */
        const chartDeath = {};

        chartBar.svg = d3.select("#chart-bars");
        chartGame.svg = d3.select("#chart-game");
        chartMean.svg = d3.select("#chart-mean");
        chartKill.svg = d3.select("#chart-kill");
        chartDeath.svg = d3.select("#chart-death");

        [chartBar.width, chartBar.height] = getDim(chartBar.svg.attr("viewBox"));
        [chartGame.width, chartGame.height] = getDim(chartGame.svg.attr("viewBox"));
        [chartMean.width, chartMean.height] = getDim(chartMean.svg.attr("viewBox"));
        [chartKill.width, chartKill.height] = getDim(chartKill.svg.attr("viewBox"));
        [chartDeath.width, chartDeath.height] = getDim(chartDeath.svg.attr("viewBox"));

        [
            chartBar.data, chartGame.data, chartMean.data,
            chartKill.data, chartDeath.data
        ] = fetchChartsData();


        /** @title Bars Chart*/

        chartBar.x = d3.scaleLinear()
            .domain([0, d3.max(chartBar.data, d => d.value)])
            .range([margin.left, chartBar.width - margin.right]);

        chartBar.y = d3.scaleBand()
            .domain(chartBar.data.map(d => d.name))
            .range([margin.top, chartBar.height - margin.bottom])
            .padding(0.1);

        chartBar.svg.selectAll("rect")
            .data(chartBar.data)
            .join("rect")
            .attr("class", "bar")
            .attr("x", chartBar.x(0))
            .attr("y", d => chartBar.y(d.name))
            .attr("width", d => chartBar.x(d.value) - chartBar.x(0))
            .attr("height", chartBar.y.bandwidth());

        chartBar.svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${margin.top})`)
            .call(d3.axisTop(chartBar.x));

        chartBar.svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(chartBar.y));


        /** @title Game Chart*/

        chartGame.x = d3.scaleTime()
            .domain(d3.extent(chartGame.data, d => d.date))
            .range([margin.left, chartGame.width - margin.right]);

        chartGame.y = d3.scaleLinear()
            .domain([0, d3.max(chartGame.data, d => d.value)])
            .range([chartGame.height - margin.bottom, margin.top]);

        const gameLineGenerator = d3.line()
            .x(d => chartGame.x(d.date))
            .y(d => chartGame.y(d.value));

        chartGame.svg.append("path")
            .datum(chartGame.data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", gameLineGenerator);

        chartGame.svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${chartGame.height - margin.bottom})`)
            .call(d3.axisBottom(chartGame.x));

        chartGame.svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(chartGame.y));


        /** @title Mean Chart*/

        chartMean.x = d3.scaleTime()
            .domain(d3.extent(chartMean.data, d => d.date))
            .range([margin.left, chartMean.width - margin.right]);

        chartMean.y = d3.scaleLinear()
            .domain([0, d3.max(chartMean.data, d => d.value)])
            .range([chartMean.height - margin.bottom, margin.top]);

        const meanLineGenerator = d3.line()
            .x(d => chartMean.x(d.date))
            .y(d => chartMean.y(d.value));

        chartMean.svg.append("path")
            .datum(chartMean.data)
            .attr("fill", "none")
            .attr("stroke", "orange")
            .attr("stroke-width", 1.5)
            .attr("d", meanLineGenerator);

        chartMean.svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${chartMean.height - margin.bottom})`)
            .call(d3.axisBottom(chartMean.x));

        chartMean.svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(chartMean.y));

        /** @title Kill Chart*/

        chartKill.x = d3.scaleTime()
            .domain(d3.extent(chartKill.data, d => d.date))
            .range([margin.left, chartKill.width - margin.right]);

        chartKill.y = d3.scaleLinear()
            .domain([0, d3.max(chartKill.data, d => d.value)])
            .range([chartKill.height - margin.bottom, margin.top]);

        const meanLineGenerator2 = d3.line()
            .x(d => chartKill.x(d.date))
            .y(d => chartKill.y(d.value));

        chartKill.svg.append("path")
            .datum(chartKill.data)
            .attr("fill", "none")
            .attr("stroke", "orange")
            .attr("stroke-width", 1.5)
            .attr("d", meanLineGenerator2);

        chartKill.svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${chartKill.height - margin.bottom})`)
            .call(d3.axisBottom(chartKill.x));

        chartKill.svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(chartKill.y));

        /** @title Death Chart*/

        chartDeath.x = d3.scaleTime()
            .domain(d3.extent(chartDeath.data, d => d.date))
            .range([margin.left, chartDeath.width - margin.right]);

        chartDeath.y = d3.scaleLinear()
            .domain([0, d3.max(chartDeath.data, d => d.value)])
            .range([chartDeath.height - margin.bottom, margin.top]);

        const meanLineGenerator3 = d3.line()
            .x(d => chartDeath.x(d.date))
            .y(d => chartDeath.y(d.value));

        chartDeath.svg.append("path")
            .datum(chartDeath.data)
            .attr("fill", "none")
            .attr("stroke", "orange")
            .attr("stroke-width", 1.5)
            .attr("d", meanLineGenerator3);

        chartDeath.svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${chartDeath.height - margin.bottom})`)
            .call(d3.axisBottom(chartDeath.x));

        chartDeath.svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(chartDeath.y));

        chartBar.svg.append("text")
            .attr("x", chartBar.width / 2)
            .attr("y", margin.top / 2)
            .attr("text-anchor", "middle")
            .attr("font-size", "32px")
            .attr("font-weight", "bold")
            .attr("fill", "white")
            .text("Bars Chart");

        chartGame.svg.append("text")
            .attr("x", chartGame.width / 2)
            .attr("y", margin.top / 2)
            .attr("text-anchor", "middle")
            .attr("font-size", "32px")
            .attr("font-weight", "bold")
            .attr("fill", "white")
            .text("Game Chart");

        chartMean.svg.append("text")
            .attr("x", chartMean.width / 2)
            .attr("y", margin.top / 2)
            .attr("text-anchor", "middle")
            .attr("font-size", "32px")
            .attr("font-weight", "bold")
            .attr("fill", "white")
            .text("Mean Chart");

        chartKill.svg.append("text")
            .attr("x", chartKill.width / 2)
            .attr("y", margin.top / 2)
            .attr("text-anchor", "middle")
            .attr("font-size", "32px")
            .attr("font-weight", "bold")
            .attr("fill", "white")
            .text("Kill Chart");

        chartDeath.svg.append("text")
            .attr("x", chartDeath.width / 2)
            .attr("y", margin.top / 2)
            .attr("text-anchor", "middle")
            .attr("font-size", "32px")
            .attr("font-weight", "bold")
            .attr("fill", "white")
            .text("Death Chart");
    }

    return [innit, `
    <main class="${styles.screen}">
        <div class="${styles.navbar}">
            <div id="btn-logo" class="${styles.clickable}">Logo</div>
            <ul>
                <li id="btn-home" class="${styles.clickable}">Home</li>
                <li id="btn-logout" class="${styles.clickable}">Logout</li>
            </ul>
        </div>
        <div class="${styles.grid}">
            <svg id="chart-bars" class="${styles.item} ${styles.chartBar}" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid meet"></svg>
            <div class="${styles.item} ${styles.counters}">
                <div id="chart-counter-fragments" class="${styles.item}"></div>
                <div id="chart-counter-fragments" class="${styles.item}"></div>
            </div>
            <svg id="chart-game" class="${styles.item} ${styles.chart} ${styles.chartGame}" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet"></svg>
            <svg id="chart-mean" class="${styles.item} ${styles.chart} ${styles.chartMean}" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet"></svg>
            
            <svg id="chart-kill" class="${styles.item} ${styles.chart} ${styles.chartKill}" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet"></svg>
            <svg id="chart-death" class="${styles.item} ${styles.chart} ${styles.chartDeath}" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet"></svg>
        </div>
    </main>
    `];
}
