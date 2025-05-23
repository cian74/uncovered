import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import PopularityGauge from "./PopularityGauge";
import saveSong from "./SaveSong";
import Login from "./Login";
import "../App.css";
import { getAuth } from "firebase/auth";
import { getDoc, setDoc, updateDoc, doc, increment } from "firebase/firestore";
import { db } from "../firebaseConfig";
import genres from "../genres.json";
import { Link } from "react-router-dom";

const LowPopularityTrack = ({ user }) => {
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true); //loading set to true initially
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState("");

  //stores visited tracks. persists when re rendered.
  const visited = useRef([]);

  useEffect(() => {
    const getSpotifyToken = async () => {
      try {
        //https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
        const { data } = await axios.post(
          "https://accounts.spotify.com/api/token",
          "grant_type=client_credentials",
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${btoa(
                process.env.REACT_APP_SPOTIFY_CLIENT_ID +
                  ":" +
                  process.env.REACT_APP_SPOTIFY_CLIENT_SECRET
              )}`,
            },
          }
        );
        console.log("data:", data);
        //stores token in accessToken state.
        setAccessToken(data.access_token);
      } catch (err) {
        console.error("Error getting Spotify token:", err);
        setError("Failed to get Spotify token.");
      }
    };
    getSpotifyToken();
  }, []);

  //function that fetches a track with low popularity
  const fetchRandomLowPopularityTrack = async () => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      //https://gist.github.com/andytlr/4104c667a62d8145aa3a
      //selects a random genre
      const randomGenre = genres[Math.floor(Math.random() * genres.length)];
      console.log(`Searching for artists in genre: ${randomGenre}`);

      //searches for arists in genre
      const { data: artistData } = await axios.get(
        `https://api.spotify.com/v1/search?q=genre:${randomGenre}&type=artist&limit=50`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      //filters through artists with less than 5000 followers
      const lowFollowerArtists = artistData.artists.items.filter(
        (artist) => artist.followers.total < 5000
      );
      //retries if no artists are found
      if (lowFollowerArtists.length === 0)
        return fetchRandomLowPopularityTrack();

      //selects a random artist from list
      const shuffledArtists = lowFollowerArtists.sort(
        () => 0.5 - Math.random()
      );
      const randomArtist = shuffledArtists[0];

      console.log(
        `Selected artist: ${randomArtist.name} (Followers: ${randomArtist.followers.total})`
      );

      //fetches aritsts albums
      const { data: albums } = await axios.get(
        `https://api.spotify.com/v1/artists/${randomArtist.id}/albums?limit=50`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      //retries if no albums are found
      if (albums.items.length === 0) return fetchRandomLowPopularityTrack();

      //chooses random album from list
      const randomAlbum =
        albums.items[Math.floor(Math.random() * albums.items.length)];

      //gets tracks from album
      const { data: albumTracks } = await axios.get(
        `https://api.spotify.com/v1/albums/${randomAlbum.id}/tracks?limit=50`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      //if no tracks are found it retries
      if (albumTracks.items.length === 0)
        return fetchRandomLowPopularityTrack();

      //selects random track from album
      const randomTrackId =
        albumTracks.items[Math.floor(Math.random() * albumTracks.items.length)]
          .id;

      //if the track has been visited already it retries
      if (visited.current.includes(randomTrackId)) {
        return fetchRandomLowPopularityTrack();
      }

      //retrieves track details
      //Track: name, id, popularity,artists,
      const { data: fullTrackDetails } = await axios.get(
        `https://api.spotify.com/v1/tracks/${randomTrackId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      console.log(
        `Track found: ${fullTrackDetails.name} by ${fullTrackDetails.artists
          .map((a) => a.name)
          .join(", ")}`
      );
      console.log(`Track popularity: ${fullTrackDetails.popularity}`);

      //checks if track has popularity score <= 5
      if (fullTrackDetails.popularity <= 5) {
        //pushes current track details
        visited.current.push({
          id: fullTrackDetails.id,
          name: fullTrackDetails.name,
        });
        //sets track details to display
        setTrack(fullTrackDetails);
        console.log("visited:", visited.current);
      } else {
        //retries if track has higher popularity score
        return fetchRandomLowPopularityTrack();
      }
    } catch (err) {
      console.error("Error fetching track:", err);
      setError(`Error: ${err.message}`);
    }

    setLoading(false);
  };

  //fetches track when access token is set
  useEffect(() => {
    if (accessToken) fetchRandomLowPopularityTrack();
  }, [accessToken]);

  const updateUserSwipes = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.log("no user found");
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        totalSwipes: 0,
      });
    }

    //updates document info
    //automatically creates the users doc if it doesnt exist
    await updateDoc(userRef, {
      totalSwipes: increment(1),
      totalLikedSongs: 0,
    });
    console.log("DEBUG: swipe");
  };

  const updateUserLikes = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.log("no user found.");
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        totalSwipes: 0,
        totalLikedSongs: 1,
      });
    }

    //updates document info
    //automatically creates the users doc if it doesnt exist
    await updateDoc(userRef, {
      totalLikedSongs: increment(1),
    });
    console.log("DEBUG: like");
  };

  return (
    <div className="container">
      <div>
        {loading ? (
          <div className="text-center">
            <p className="text-gray-600">Searching the depths of Spotify...</p>
            {/* Add animation effect while loading */}
            <div className="loader"></div>
          </div>
        ) : error ? (
          <div>
            <p>{error}</p>
            <button onClick={() => fetchRandomLowPopularityTrack()}>
              Try Again
            </button>
          </div>
        ) : track ? (
          <div className={`fade-in`}>
            {/* Popularity Gauge & Album Cover Side by Side */}
            <div className="track-layout">
              {/* Popularity Gauge */}
              <div className="flex-shrink-0">
                {track && <PopularityGauge popularity={track.popularity} />}
              </div>

              {/* Album Cover */}
              {track.album.images.length > 0 && (
                <img src={track.album.images[0].url} alt={track.album.name} />
              )}
            </div>

            {/* Track Details */}
            <div className="track-details">
              <h2 className="text-xl font-semibold">{track.name}</h2>
              <h3>by {track.artists.map((a) => a.name).join(", ")}</h3>
              <p className="text-sm text-gray-500 mb-1">
                From the album: {track.album.name}
              </p>
            </div>

            {/* Audio Preview */}
            {track.preview_url && (
              <div>
                <p>Play: </p>
                <audio controls className="w-full mt-4" autoPlay={false}>
                  <source src={track.preview_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Spotify Link */}
            <a
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="song-link"
            >
              Listen on Spotify
            </a>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-4">No obscure tracks found. Try again!</p>
            <button
              onClick={() => fetchRandomLowPopularityTrack()}
            
            >
            </button>
          </div>
        )}
      </div>
      {track && (
  <div className="action-buttons">
    {/* Like Button */}
    <button
  className="icon-button"
  onClick={() => {
    saveSong(user, track);
    updateUserLikes();
  }}
>
  <img src="/heart1.png" alt="Like" />
</button>

<button
  className="icon-button"
  onClick={() => {
    setLoading(true);
    fetchRandomLowPopularityTrack();
    updateUserSwipes();
  }}
>
  <img src="/skip.png" alt="Skip" />
</button>
  </div>
)}

<Login as={Link} to="/login"/>
    </div>
  );
};

export default LowPopularityTrack;
