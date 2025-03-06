import React, { useState, useEffect } from "react";
import axios from "axios";
import PopularityGauge from "./PopularityGauge";
import "../App.css";

const LowPopularityTrack = () => {
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState("");

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
        "lo-fi",
        "experimental",
        "psychedelic",
        "dark-ambient",
      ];
      const randomGenre = genres[Math.floor(Math.random() * genres.length)];
      console.log(`Searching for artists in genre: ${randomGenre}`);


      const { data: artistData } = await axios.get(
        `https://api.spotify.com/v1/search?q=genre:${randomGenre}&type=artist&limit=50`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const lowFollowerArtists = artistData.artists.items.filter(
        (artist) => artist.followers.total < 1000
      );
      if (lowFollowerArtists.length === 0)
        return fetchRandomLowPopularityTrack();

      const randomArtist =
        lowFollowerArtists[
          Math.floor(Math.random() * lowFollowerArtists.length)
        ];
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
        setTrack(fullTrackDetails);
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
        <h1 className="text-2xl font-bold mb-4 text-center">
          Obscure Music Finder
        </h1>

        {loading ? (
          <p className="text-gray-600 text-center">
            Searching the depths of Spotify...
          </p>
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
          <div>
            {/* Popularity Gauge & Album Cover Side by Side */}
            <div className="flex items-center w-full">
              <PopularityGauge popularity={track.popularity} />
              {track.album.images.length > 0 && (
                <img
                  src={track.album.images[0].url}
                  alt={track.album.name}
                  className="w-64 h-64 object-cover rounded-md shadow-lg"
                />
              )}
            </div>

            {/* Track Details (Centered Below) */}
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

            {/* New Track Button */}
            <button
              onClick={() => fetchRandomLowPopularityTrack()}
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
    </div>
  );
};

export default LowPopularityTrack;
