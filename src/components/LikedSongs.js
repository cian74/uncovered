import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebaseConfig";

const LikedSongs = () => {
  const [songList, setSongList] = useState(null);
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          setLoading(false);
          console.log("No user logged in");
          return;
        }

        //https://firebase.google.com/docs/firestore/query-data/get-data#web_2
        //querying firestore for users songs collection

        const q = query(
          collection(db, "likedSongs"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);

        const songs = [];

        //creating a new doc to save liked songs to
        querySnapshot.forEach((doc) => {
          songs.push({ id: doc.id, ...doc.data() });
        });
        console.log("Fetched Songs:", songs);
      } catch (error) {
        console.error("Error fetching songs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLikedSongs();
  }, []);

  //return some div
};

export default LikedSongs;
