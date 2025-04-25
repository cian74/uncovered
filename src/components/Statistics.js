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

    const width = 300;
    const height = 200;
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
      .call(d3.axisBottom(x));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    svg
      .selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("x", (d) => x(d.label))
      .attr("y", (d) => y(d.value))
      .attr("height", (d) => y(0) - y(d.value))
      .attr("width", x.bandwidth())
      .attr("fill", "#9046CF");

    svg
      .selectAll(".label")
      .data(data)
      .join("text")
      .attr("x", (d) => x(d.label) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.value) - 5)
      .attr("text-anchor", "middle")
      .text((d) => Math.round(d.value));
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
