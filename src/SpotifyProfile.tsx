import React, { useEffect } from 'react';

const SpotifyProfile = () => {
  useEffect(() => {
    // Spotify API client ID
    const clientId = 'your-client-id-here';

    // Extracting authorization code from the URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    // Check if the authorization code is present
    if (!code) {
      // If not, redirect to Spotify authorization page
      redirectToAuthCodeFlow(clientId);
    } else {
      // If authorization code is present, proceed to get access token and fetch profile
      (async () => {
        const accessToken = await getAccessToken(clientId, code);
        const profile = await fetchProfile(accessToken);
        populateUI(profile);
      })();
    }

    // Function to redirect to Spotify authorization page
    async function redirectToAuthCodeFlow(clientId) {
      // Generate and store code verifier
      const verifier = generateCodeVerifier(128);
      const challenge = await generateCodeChallenge(verifier);

      localStorage.setItem("verifier", verifier);

      // Build authorization URL with necessary parameters
      const params = new URLSearchParams();
      params.append("client_id", clientId);
      params.append("response_type", "code");
      params.append("redirect_uri", "http://localhost:5173/callback");
      params.append("scope", "user-read-private user-read-email");
      params.append("code_challenge_method", "S256");
      params.append("code_challenge", challenge);

      // Redirect to Spotify authorization page
      document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
    }

    // Function to get access token using authorization code
    async function getAccessToken(clientId, code) {
      const verifier = localStorage.getItem("verifier");

      // Build parameters for token exchange
      const params = new URLSearchParams();
      params.append("client_id", clientId);
      params.append("grant_type", "authorization_code");
      params.append("code", code);
      params.append("redirect_uri", "http://localhost:5173/callback");
      params.append("code_verifier", verifier!);

      // Exchange authorization code for access token
      const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
      });

      const { access_token } = await result.json();
      return access_token;
    }

    // Function to fetch user profile using access token
    async function fetchProfile(token) {
      const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
      });

      return await result.json();
    }

    // Function to populate the UI with user profile data
    function populateUI(profile) {
      document.getElementById("displayName")!.innerText = profile.display_name;
      if (profile.images[0]) {
        const profileImage = new Image(200, 200);
        profileImage.src = profile.images[0].url;
        document.getElementById("avatar")!.appendChild(profileImage);
      }
      document.getElementById("id")!.innerText = profile.id;
      document.getElementById("email")!.innerText = profile.email;
      document.getElementById("uri")!.innerText = profile.uri;
      document.getElementById("uri")!.setAttribute("href", profile.external_urls.spotify);
      document.getElementById("url")!.innerText = profile.href;
      document.getElementById("url")!.setAttribute("href", profile.href);
      document.getElementById("imgUrl")!.innerText = profile.images[0]?.url ?? '(no profile image)';
    }
  }, []);

  // Render the Spotify profile UI
  return (
    <div>
      <h1>Display your Spotify profile data</h1>
      <section id="profile">
        <h2>Logged in as <span id="displayName"></span></h2>
        <span id="avatar"></span>
        <ul>
          <li>User ID: <span id="id"></span></li>
          <li>Email: <span id="email"></span></li>
          <li>Spotify URI: <a id="uri" href="#"></a></li>
          <li>Link: <a id="url" href="#"></a></li>
          <li>Profile Image: <span id="imgUrl"></span></li>
        </ul>
      </section>
    </div>
  );
};

export default SpotifyProfile;

