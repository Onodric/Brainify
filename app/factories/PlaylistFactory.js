'use strict';

app.factory('UserPlaylists', ($q, $http, Spotify) => {

  // Returns the current user information
  let getUserInfo = () => {
    // Stores the user object upon login
    let user;

    return Spotify.getCurrentUser()
      .then((currentUser) => {
        console.log('Logged in user: ', currentUser);
        user = currentUser;
      })
      .catch((error) => {
        return $q.reject(new Error('No signed in user.'));
      })
      .then((currentUser) => {
        // Find the user's playlists
        return Spotify.getUserPlaylists(user.id);
      })
      .catch((error) => {
        // If the user has no playlists
        return $q.reject(new Error('No playlists found.'));
      })
      .then((playlistsObj) => {
        // Save the users playlists
        user.playlists = playlistsObj.items;

        // Find the songs in each playlist
        return $q.all(
          user.playlists.map((playlist) => {
            return Spotify.getPlaylistTracks(playlist.owner.id, playlist.id);
          })
        );
      })
      .then((playlistsArray) => {
        // Save the songs in each playlist
        playlistsArray.forEach((playlist, index) => {
          user.playlists[index].songList = playlist;
        });

        console.log('Returning user:', user);

        // Returning the cached user object
        return $q.resolve(user);
      });
  };

  // Stores the user's selected playlist. Used to train a neural network.
  let playlist;

  // Used to cache the selected playlist
  let setSelectedPlaylist = (playlistArray) => {
    playlist = playlistArray;
  };

  // Returns the selected playlist
  let getSelectedPlaylist = () => playlist;

  return {
    getUserInfo,
    setSelectedPlaylist,
    getSelectedPlaylist
  };
});
