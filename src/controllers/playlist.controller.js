import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new playlist
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  // TODO: create a new playlist for the logged-in user
});

// Get all playlists of a specific user
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  // TODO: fetch all playlists created by a given user
});

// Get a playlist by its ID
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: fetch details of a single playlist (including videos)
});

// Add a video to a playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: add a video to a playlist
});

// Remove a video from a playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove a video from a playlist
});

// Delete a playlist
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete a playlist
});

// Update playlist details
const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  // TODO: update playlist name/description
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
