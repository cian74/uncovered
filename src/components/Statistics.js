import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useEffect, useRef, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Card } from "react-bootstrap";
import * as d3 from "d3";

const Statistics = () => {
  const [stats, setStats] = useState({ totalSwipes: 0, totalLikedSongs: 0 });
  const [averageSwipes, setAverageSwipes] = useState(0);
  const [loading, setLoading] = useState(true);
  const graphRef = useRef();
  const pieChartRef = useRef();

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("DEBUG: No user.");
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        let totalSwipes = 0;
        let totalLikedSongs = 0;

        if (userSnap.exists()) {
          const userData = userSnap.data();
          totalSwipes = userData.totalSwipes || 0;
        }

        //query to db
        const likedSongsRef = collection(db, "likedSongs");
        const q = query(likedSongsRef, where("userId", "==", user.uid));
        const likedSongsSnap = await getDocs(q);
        totalLikedSongs = likedSongsSnap.size;

        const usersSnap = await getDocs(collection(db, "users"));
        let allUsersSwipes = 0;
        usersSnap.forEach((doc)=> {
          allUsersSwipes += doc.data().totalSwipes || 0;
        });

        const avgSwipes = usersSnap.size > 0 ? allUsersSwipes / usersSnap.size : 0;
        setAverageSwipes(avgSwipes);

        console.log(avgSwipes);

        setStats({ totalSwipes, totalLikedSongs });
        console.log("user stats", totalLikedSongs, totalSwipes);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup listener when component unmounts
  }, []);

  useEffect(() => {
    if(loading || !graphRef.current) return;

    const data = [
      { label: "You", value: stats.totalSwipes},
      {label: "Avg User", value: averageSwipes},
    ];

    const pieData = [
      { label: "Liked Songs", value: stats.totalLikedSongs },
      { label: "Total Swipes", value: stats.totalSwipes - stats.totalLikedSongs }, // Remaining swipes
    ];

    const width = 600;
    const height = 400;
    const margin = { top: 30, right: 30, bottom: 30, left: 40 };

    d3.select(graphRef.current).selectAll("*").remove(); // Clear existing

    const svg = d3
      .select(graphRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, Math.max(...data.map((d) => d.value)) + 5])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .style("font", "20px Syne, sans-serif")
      .call(d3.axisBottom(x));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .style("font", "20px Syne, sans-serif")
      .call(d3.axisLeft(y));

    svg
      .selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("x", (d) => x(d.label))
      .attr("y", (d) => y(d.value))
      .attr("height", (d) => y(0) - y(d.value))
      .attr("width", x.bandwidth())
      .attr("fill", "#F6F740");

    svg
      .selectAll(".label")
      .data(data)
      .join("text")
      .attr("x", (d) => x(d.label) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.value) - 5)
      .attr("text-anchor", "middle")
      .text((d) => Math.round(d.value));

      const radius = Math.min(width, height) / 3;
      const pie = d3.pie().value((d) => d.value);
      const arc = d3.arc().outerRadius(radius - 10).innerRadius(0);
      const color = d3.scaleOrdinal(["#F6F740", "#EF5B5B"]);
  
      const pieSvg = d3
        .select(pieChartRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);
  
      const pieArcs = pieSvg
        .selectAll(".arc")
        .data(pie(pieData))
        .join("g")
        .attr("class", "arc");
  
      pieArcs
        .append("path")
        .attr("d", arc)
        .attr("fill", (d) => color(d.data.label))
        .attr("opacity", 0) 
        .transition() // Animate the pie slices
        .duration(1000)
        .attr("opacity", 1); 
  
      pieArcs
        .append("text")
        .attr("transform", (d) => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .style("fill", "#000")
        .text((d) => `${Math.round(d.data.value)}`);

  }, [stats, averageSwipes, loading]);

  return (
    <div className="container mt-5">
    <h2 className="text-xl font-semibold mb-4">Your Statistics</h2>

    {loading ? (
      <p>Loading stats...</p>
    ) : (
      <div>
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
  <Card style={{ flex: 1, padding: "10px" }} className="stats-card">
    <div>
      <strong>Total Swipes:</strong> {stats.totalSwipes}
    </div>
  </Card>

  <Card style={{ flex: 1, padding: "10px" }} className="stats-card">
    <div>
      <strong>Liked Songs:</strong> {stats.totalLikedSongs}
    </div>
  </Card>
</div>
      <div className="pie-chart-container">
          <h5 >Liked Songs vs Non-Liked Songs</h5>
          <div ref={pieChartRef}></div>
        </div>
        
        <div className="chart-container">
          <h5>Swipes vs Average User</h5>
          <div ref={graphRef}></div>
        </div>
      </div>
    )}
  </div>
  );
};

export default Statistics;
