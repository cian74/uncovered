import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebaseConfig";
import { doc } from "firebase/firestore";

const LikedSongs = ({ user }) => {
  const [songList, setSongList] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSongList([]);
      return;
    }
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
        setSongList(songs);
      } catch (error) {
        console.error("Error fetching songs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLikedSongs();
  }, [user]);


  const handleDelete = async (songId) => {
    try{
      const songRef = doc(db, "likedSongs", songId);
      await deleteDoc(songRef);

      console.log("song deleted", songId);  
      setSongList(songList.filter((song)=> song.id !== songId));
    } catch (err) {

    }
  };

  return (
    <div className="liked-container">
      <h2>Your Liked Songs</h2>

      {loading ? (
        <p>Loading...</p>
      ) : songList.length === 0 ? (
        <p>No liked songs found.</p>
      ) : (
        <ul className="like-list">
          {songList.map((song) => (
            <li className="liked-item" key={song.id}>
                <img className="likedsong-image" src={song.image} />
                <strong className="like-text">{song.trackName}</strong> by {song.artist}
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(song.id)}
                >
                  Delete
                </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LikedSongs;
