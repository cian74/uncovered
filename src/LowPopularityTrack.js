import React, { useState, useEffect } from "react";
import axios from "axios";

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

const LowPopularityTrack = () => {
    const [track, setTrack] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [accessToken, setAccessToken] = useState("");
    const [searchStats, setSearchStats] = useState({ attempts: 0, artistsChecked: 0 });

    useEffect(() => {
        const getSpotifyToken = async () => {
            try {
                const { data } = await axios.post(
                    "https://accounts.spotify.com/api/token",
                    "grant_type=client_credentials",
                    {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            Authorization: `Basic ${btoa(CLIENT_ID + ":" + CLIENT_SECRET)}`,
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

    const fetchRandomLowPopularityTrack = async (retryCount = 0) => {
        if (!accessToken || retryCount > 15) {
            setLoading(false);
            if (retryCount > 15) setError("Reached maximum search attempts. Try again later.");
            return;
        }
        
        setLoading(true);
        setError(null);
        setSearchStats(prev => ({ ...prev, attempts: prev.attempts + 1 }));

        try {
            // Expanded list of niche genres to find more obscure music
            const genres = [
                "ambient", "experimental", "noise", "drone", "field-recording", 
                "free-folk", "free-jazz", "sound-art", "musique-concrete", 
                "lowercase", "outsider", "lo-fi", "found-sound", "avant-garde",
                "minimal-techno", "deep-techno", "dark-ambient", "vaporwave",
                "indie-folk", "psychedelic-folk", "freak-folk", "slowcore",
                "post-minimalism", "new-weird-america", "circuit-bending"
            ];
            
            const randomGenre = genres[Math.floor(Math.random() * genres.length)];
            console.log(`Searching for artists in genre: ${randomGenre}`);

            // Use offset to get deeper into results
            const offset = Math.floor(Math.random() * 500);
            
            const { data: artistData } = await axios.get(
                `https://api.spotify.com/v1/search?q=genre:${randomGenre}&type=artist&limit=50&offset=${offset}`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            
            // Look for artists with extremely low followers
            const veryLowFollowerArtists = artistData.artists.items.filter(artist => artist.followers.total < 1000);
            setSearchStats(prev => ({ ...prev, artistsChecked: prev.artistsChecked + artistData.artists.items.length }));
            
            if (veryLowFollowerArtists.length === 0) {
                console.warn("No suitable artists found, retrying...");
                return fetchRandomLowPopularityTrack(retryCount + 1);
            }

            const randomArtist = veryLowFollowerArtists[Math.floor(Math.random() * veryLowFollowerArtists.length)];
            console.log(`Selected artist: ${randomArtist.name} (Followers: ${randomArtist.followers.total})`);

            // Try to get all tracks from this artist instead of just top tracks
            const { data: albums } = await axios.get(
                `https://api.spotify.com/v1/artists/${randomArtist.id}/albums?include_groups=album,single,appears_on&limit=50`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            
            if (albums.items.length === 0) {
                console.warn("No albums found for this artist, retrying...");
                return fetchRandomLowPopularityTrack(retryCount + 1);
            }
            
            // Randomly select an album
            const randomAlbum = albums.items[Math.floor(Math.random() * albums.items.length)];
            
            // Get tracks from the album
            const { data: albumTracks } = await axios.get(
                `https://api.spotify.com/v1/albums/${randomAlbum.id}/tracks?limit=50`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            
            if (albumTracks.items.length === 0) {
                console.warn("No tracks found in this album, retrying...");
                return fetchRandomLowPopularityTrack(retryCount + 1);
            }
            
            // Get full track details to check popularity
            const randomTrackId = albumTracks.items[Math.floor(Math.random() * albumTracks.items.length)].id;
            
            const { data: fullTrackDetails } = await axios.get(
                `https://api.spotify.com/v1/tracks/${randomTrackId}`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            
            // Check if it's a low popularity track (0-5 popularity)
            if (fullTrackDetails.popularity <= 5) {
                setTrack(fullTrackDetails);
            } else {
                console.warn(`Track popularity (${fullTrackDetails.popularity}) too high, retrying...`);
                return fetchRandomLowPopularityTrack(retryCount + 1);
            }
        } catch (err) {
            console.error("Error fetching track:", err);
            setError(`Error: ${err.message}`);
            return fetchRandomLowPopularityTrack(retryCount + 1);
        }

        setLoading(false);
    };

    useEffect(() => {
        if (accessToken) {
            fetchRandomLowPopularityTrack();
        }
    }, [accessToken]);

    return (
        <div className="max-w-md mx-auto p-4 bg-gray-50 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4 text-center">Obscure Music Finder</h1>
            
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <p className="text-gray-600">Searching the depths of Spotify...</p>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{error}</p>
                    <button 
                        onClick={() => fetchRandomLowPopularityTrack()} 
                        className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                    >
                        Try Again
                    </button>
                </div>
            ) : track ? (
                <div className="flex flex-col items-center">
                    {track.album.images.length > 0 && (
                        <img 
                            src={track.album.images[0].url} 
                            alt={track.album.name} 
                            className="w-64 h-64 object-cover rounded-md shadow-lg mb-4" 
                        />
                    )}
                    <h2 className="text-xl font-semibold mb-1">{track.name}</h2>
                    <h3 className="text-md text-gray-700 mb-3">by {track.artists.map(a => a.name).join(", ")}</h3>
                    <p className="text-sm text-gray-500 mb-1">From the album: {track.album.name}</p>
                    <p className="text-sm text-gray-500 mb-4">Popularity: {track.popularity}/100</p>
                    
                    {track.preview_url && (
                        <audio controls className="w-full mb-4">
                            <source src={track.preview_url} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
                    )}
                    
                    <a 
                        href={track.external_urls.spotify} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
                    >
                        Listen on Spotify
                    </a>
                    
                    <button 
                        onClick={() => fetchRandomLowPopularityTrack()} 
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Discover Another Track
                    </button>
                    
                    <div className="text-xs text-gray-400 mt-4">
                        Search attempts: {searchStats.attempts} | Artists checked: {searchStats.artistsChecked}
                    </div>
                </div>
            ) : (
                <div className="text-center p-4">
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
    );
};

export default LowPopularityTrack;