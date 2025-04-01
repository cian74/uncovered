import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const saveSong = async (user, track) => {
  if (!user) {
    alert("Please log in to save songs.");
    return;
  }

  try {
    await addDoc(collection(db, "likedSongs"), {
      userId: user.uid,
      trackName: track.name,
      artist: track.artists.map((a) => a.name).join(", "), //can be multiple artists featured
      album: track.album.name,
      image: track.album.images[0]?.url,
      spotifyUrl: track.external_urls.spotify,
    });
    //alert("Song saved!");
    //TODO: add popup card.
  } catch (error) {
    console.error("Error saving song:", error);
  }
};

export default saveSong;
