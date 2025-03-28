import { collection, doc, getDoc, getDocs, query, where, } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Statistics = () => {
  const [stats, setStats] = useState({ totalSwipes: 0, totalLikedSongs: 0 });
  const [loading, setLoading] = useState(true);

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
