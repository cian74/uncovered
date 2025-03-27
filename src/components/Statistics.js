import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

const Statistics = () => {
  const [stats, setStats] = useState({ totalSwipes: 0, totalLikedSongs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.log("DEBUG: no user.");
        setLoading(false);
        return;
      }

      try {
        //getting user stats from db
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setStats(userData);
          console.log("userData: ", userData);
        } else {
          console.log("no stats found.");
        }
      } catch (error) {
        console.error("error fetching user stats");
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  return (
    <div className="container">
      <h2 className="text-xl font-semibold mb-4">Your Statistics</h2>

      {loading ? (
        <p>Loading stats...</p>
      ) : (
        <div>
          <p>
            <strong>Total Swipes:</strong> {stats.totalSwipes}
          </p>
          <p>
            <strong>Liked Songs:</strong> {stats.totalLikedSongs}
          </p>
        </div>
      )}
    </div>
  );
};

export default Statistics;