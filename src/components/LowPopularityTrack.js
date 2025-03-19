import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import PopularityGauge from "./PopularityGauge";
import saveSong from "./SaveSong";
import Login from "./Login";
import "../App.css";

const LowPopularityTrack = () => {
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const [user,setUser] = useState(null);

  const visited = useRef([]);

  useEffect(() => {
    const getSpotifyToken = async () => {
      try {
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
        setAccessToken(data.access_token);
      } catch (err) {
        console.error("Error getting Spotify token:", err);
        setError("Failed to get Spotify token.");
      }
    };
    getSpotifyToken();
  }, []);

  const fetchRandomLowPopularityTrack = async () => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const genres = [
        "ambient",
        "experimental",
        "noise",
        "drone",
        "field-recording",
        "free-folk",
        "free-jazz",
        "sound-art",
        "musique-concrete",
        "lowercase",
        "outsider",
        "lo-fi",
        "found-sound",
        "avant-garde",
        "minimal-techno",
        "deep-techno",
        "experimental",
        "psychedelic",
        "dark-ambient",
        "vaporwave",
        "indie-folk",
        "psychedelic-folk",
        "freak-folk",
        "slowcore",
        "post-minimalism",
        "new-weird-america",
        "circuit-bending",
      ];
      const randomGenre = genres[Math.floor(Math.random() * genres.length)];
      console.log(`Searching for artists in genre: ${randomGenre}`);

      const { data: artistData } = await axios.get(
        `https://api.spotify.com/v1/search?q=genre:${randomGenre}&type=artist&limit=50`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const lowFollowerArtists = artistData.artists.items.filter(
        (artist) => artist.followers.total < 5000
      );
      if (lowFollowerArtists.length === 0)
        return fetchRandomLowPopularityTrack();

      const shuffledArtists = lowFollowerArtists.sort(
        () => 0.5 - Math.random()
      );
      const randomArtist = shuffledArtists[0];

      console.log(
        `Selected artist: ${randomArtist.name} (Followers: ${randomArtist.followers.total})`
      );

      const { data: albums } = await axios.get(
        `https://api.spotify.com/v1/artists/${randomArtist.id}/albums?limit=50`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (albums.items.length === 0) return fetchRandomLowPopularityTrack();

      const randomAlbum =
        albums.items[Math.floor(Math.random() * albums.items.length)];

      const { data: albumTracks } = await axios.get(
        `https://api.spotify.com/v1/albums/${randomAlbum.id}/tracks?limit=50`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (albumTracks.items.length === 0)
        return fetchRandomLowPopularityTrack();

      const randomTrackId =
        albumTracks.items[Math.floor(Math.random() * albumTracks.items.length)]
          .id;

      if (visited.current.includes(randomTrackId)) {
        return fetchRandomLowPopularityTrack();
      }

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

      if (fullTrackDetails.popularity <= 5) {
        visited.current.push({
          id: fullTrackDetails.id,
          name: fullTrackDetails.name
        });
        setTrack(fullTrackDetails);
        console.log("visited:", visited.current);
      } else {
        return fetchRandomLowPopularityTrack();
      }
    } catch (err) {
      console.error("Error fetching track:", err);
      setError(`Error: ${err.message}`);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (accessToken) fetchRandomLowPopularityTrack();
  }, [accessToken]);


  return (
    <div className="container">
      <div className="max-w-2xl w-full p-6 bg-white rounded-lg shadow-md">

        {loading ? (
          <div className="text-center">
            <p className="text-gray-600">Searching the depths of Spotify...</p>
            {/* Add animation effect while loading */}
            <div className="loader"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            <button
              onClick={() => fetchRandomLowPopularityTrack()}
              className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
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
                <img
                  src={track.album.images[0].url}
                  alt={track.album.name}
                  className="w-64 h-64 object-cover rounded-md shadow-lg"
                />
              )}
            </div>

            {/* Track Details */}
            <div className="track-details">
              <h2 className="text-xl font-semibold">{track.name}</h2>
              <h3 className="text-md text-gray-700 mb-3">
                by {track.artists.map((a) => a.name).join(", ")}
              </h3>
              <p className="text-sm text-gray-500 mb-1">
                From the album: {track.album.name}
              </p>
            </div>

            {/* Audio Preview */}
            {track.preview_url && (
              <audio controls className="w-full mt-4">
                <source src={track.preview_url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}

            {/* Spotify Link */}
            <a
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
            >
              Listen on Spotify
            </a>

            <button
              onClick={() => {
                setLoading(true);
                fetchRandomLowPopularityTrack();
              }}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
            >
              Discover Another Track
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-4">No obscure tracks found. Try again!</p>
            <button
              onClick={() => fetchRandomLowPopularityTrack()}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Start Discovery
            </button>
          </div>
        )}
      </div>
      <div>
    <Login setUser={setUser} />
    {track && (
      <button onClick={() => saveSong(user, track)}>Like this Song</button>
    )}
  </div>
    </div>
  );
};

export default LowPopularityTrack;
