// src/core/utils/audiomanager.js
"use strict";
import logger from "./logger.js";
import eventBus from "./eventbus.js";

class AudioManager {
    constructor() {
        // Audio elements cache
        this.audioElements = {};

        // Active sound effect instances (for cleanup)
        this.activeSoundEffects = new Set();

        // Volume controls
        this.masterVolume = 1.0;
        this.sfxVolume = 1.0;
        this.musicVolume = 0.7;

        // Currently playing music
        this.currentMusic = null;
        this.currentMusicId = null;

        // Sound mappings for events (configurable)
        this.eventSoundMap = {
            "flood:attack": "attack",
            "flood:evolve": "evolve",
            "flood:createClone": "clone",
            "flood:takeDamage": "floodDamage",
            "flood:die": "floodDie",
            "flood:infectHuman": "infectHuman",
            "human:takeDamage": "humanDamage",
            "human:die": "humanDie",
            "human:attack": "humanAttack",
            "human:shoot": "humanShoot",
            

            "ui:buttonClick": "click"
        };

        // Music mappings for game states
        this.musicStateMap = {
            "game:start": "battle",
            "game:menu": "menu"
        };

        // Check audio format support
        this.supportedFormats = this.getSupportedFormats();

        // Set up event listeners
        this._setupEventListeners();

        // Clean up finished sound effects periodically to prevent memory leaks
        this._setupCleanupInterval();

        logger.info("AudioManager initialized");
    }

    _setupEventListeners() {
        // Set up sound effect events
        Object.entries(this.eventSoundMap).forEach(([event, soundId]) => {
            eventBus.on(event, () => {
                if (this.audioElements[soundId]) {
                    this.play(soundId);
                } else {
                    logger.warn(`Event ${event} mapped to missing sound: ${soundId}`);
                }
            });
        });

        // Set up music state events
        Object.entries(this.musicStateMap).forEach(([event, musicId]) => {
            eventBus.on(event, () => {
                if (this.audioElements[musicId]) {
                    this.playMusic(musicId);
                } else {
                    logger.warn(`Event ${event} mapped to missing music: ${musicId}`);
                }
            });
        });
    }

    _setupCleanupInterval() {
        // Clean up finished sound effects every 5 seconds
        setInterval(() => {
            this.activeSoundEffects.forEach(audio => {
                if (audio.ended || audio.paused) {
                    this.activeSoundEffects.delete(audio);
                }
            });
        }, 5000);
    }

    /**
     * Configure event to sound mappings
     * @param {Object} mappings - Object mapping event names to sound IDs
     */
    configureEventSounds(mappings) {
        // Remove existing listeners first
        Object.keys(this.eventSoundMap).forEach(event => {
            eventBus.off(event);
        });

        // Update mappings
        this.eventSoundMap = { ...mappings };

        // Re-setup listeners
        this._setupEventListeners();
        logger.info("Event sound mappings updated");
    }

    /**
     * Check if the browser can play a specific audio format
     * @param {string} type - MIME type to check
     * @returns {boolean} - Whether the format is supported
     */
    _canPlayType(type) {
        const audio = document.createElement('audio');
        return !!audio.canPlayType(type);
    }

    /**
     * Get supported audio formats for this browser
     * @returns {Object} - Object with format support information
     */
    getSupportedFormats() {
        const formats = {
            mp3: this._canPlayType('audio/mpeg'),
            ogg: this._canPlayType('audio/ogg; codecs="vorbis"'),
            wav: this._canPlayType('audio/wav; codecs="1"'),
            aac: this._canPlayType('audio/aac'),
            m4a: this._canPlayType('audio/x-m4a'),
            webm: this._canPlayType('audio/webm; codecs="vorbis"')
        };

        logger.info(`Browser audio format support: ${JSON.stringify(formats)}`);
        return formats;
    }

    /**
     * Load and cache an audio element with format fallbacks
     * @param {string} id - Sound identifier
     * @param {string|Array} src - Audio file path or array of paths with different formats
     * @param {Object} options - Additional options
     * @returns {Promise} - Promise resolving when audio is loaded
     */
    loadSound(id, src, options = {}) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();

            // Convert single source to array for consistent handling
            const sources = Array.isArray(src) ? src : [src];

            // If no sources provided, reject immediately
            if (sources.length === 0) {
                const error = new Error(`No sources provided for sound ${id}`);
                logger.error(error.message);
                reject(error);
                return;
            }

            // Set up load handler
            audio.addEventListener("canplaythrough", () => {
                logger.info(`Sound ${id} loaded successfully from ${audio.src}`);

                // Store in cache
                this.audioElements[id] = {
                    element: audio,
                    src: audio.src,
                    sources, // Keep all sources for reference
                    options: {
                        ...options,
                        volume: options.volume || 1.0
                    },
                    type: options.type || 'sfx'
                };

                resolve(this);
            }, { once: true });

            // Track current source index
            let currentSourceIndex = 0;

            // Handle errors by trying the next source
            const tryNextSource = () => {
                // The error details are in the audio.error property
                let errorCode = audio.error ? audio.error.code : 0;
                let errorType = "";

                // MediaError codes
                switch (errorCode) {
                    case 1: errorType = "Loading aborted"; break;
                    case 2: errorType = "Network error"; break;
                    case 3: errorType = "Decoding error"; break;
                    case 4: errorType = "Format not supported"; break;
                    default: errorType = "Unknown error";
                }

                logger.warn(`Failed to load sound ${id} from ${audio.src}: ${errorType}`);

                // Try next source
                currentSourceIndex++;
                if (currentSourceIndex < sources.length) {
                    logger.info(`Trying alternate format for ${id}: ${sources[currentSourceIndex]}`);
                    audio.src = sources[currentSourceIndex];
                } else {
                    // All sources failed
                    const error = new Error(`All formats failed for sound ${id}. Last error: ${errorType}`);
                    logger.error(error.message);
                    reject(error);
                }
            };

            // Set up error handler to try next source
            audio.addEventListener("error", tryNextSource, { once: false });

            // Apply options
            audio.loop = !!options.loop;
            audio.preload = "auto"; // Ensure we're actually loading the audio

            // Initial volume setting
            const volume = (options.volume || 1.0);
            const isSfx = !(options.type === 'music');
            const scaledVolume = isSfx ?
                volume * this.sfxVolume * this.masterVolume :
                volume * this.musicVolume * this.masterVolume;

            audio.volume = scaledVolume;

            // Start with first source
            audio.src = sources[0];
        });
    }

    /**
     * Load multiple sounds at once
     * @param {Array} soundsData - Array of sound configs
     * @returns {Promise} - Promise resolving when all sounds are loaded
     */
    loadSounds(soundsData) {
        const promises = soundsData.map(sound =>
            this.loadSound(sound.id, sound.src, sound.options)
        );

        return Promise.all(promises)
            .then(() => {
                logger.info(`Loaded ${soundsData.length} audio files`);
                return this;
            })
            .catch(err => {
                logger.error(`Failed to load some audio files: ${err.message}`);
                throw err;
            });
    }

    /**
     * Play a sound effect
     * @param {string} id - Sound identifier
     * @returns {HTMLAudioElement|null} - The playing audio element or null if not found
     */
    play(id) {
        if (!this.audioElements[id]) {
            logger.warn(`Sound not found: ${id}`);
            return null;
        }

        const sound = this.audioElements[id];

        // Clone the audio element for overlapping sounds
        const audioElement = sound.element.cloneNode();

        // Apply current volume settings
        audioElement.volume = (sound.options.volume || 1.0) * this.sfxVolume * this.masterVolume;

        // Add to active sounds for tracking
        this.activeSoundEffects.add(audioElement);

        // Clean up when sound finishes
        audioElement.addEventListener("ended", () => {
            this.activeSoundEffects.delete(audioElement);
        }, { once: true });

        // Play the sound
        audioElement.play()
            .catch(err => {
                logger.error(`Failed to play sound ${id}: ${err.message || 'Unknown error'}`);
                this.activeSoundEffects.delete(audioElement);
            });

        return audioElement;
    }

    /**
     * Play background music
     * @param {string} id - Music identifier
     * @returns {boolean} - Success status
     */
    playMusic(id) {
        if (!this.audioElements[id]) {
            logger.warn(`Music not found: ${id}`);
            return false;
        }

        // If same music is already playing, do nothing
        if (this.currentMusicId === id && !this.currentMusic.paused) {
            return true;
        }

        // Stop current music
        this.stopMusic();

        const music = this.audioElements[id].element;

        // Set volume
        music.volume = (this.audioElements[id].options.volume || 1.0) *
            this.musicVolume *
            this.masterVolume;

        // Play music
        music.currentTime = 0;
        music.play()
            .catch(err => {
                logger.error(`Failed to play music ${id}: ${err.message || 'Unknown error'}`);
                return false;
            });

        this.currentMusic = music;
        this.currentMusicId = id;

        logger.info(`Playing music: ${id}`);
        return true;
    }

    /**
     * Pause currently playing music
     */
    pauseMusic() {
        if (this.currentMusic && !this.currentMusic.paused) {
            this.currentMusic.pause();
            logger.info(`Music paused: ${this.currentMusicId}`);
        }
    }

    /**
     * Resume paused music
     */
    resumeMusic() {
        if (this.currentMusic && this.currentMusic.paused) {
            this.currentMusic.play()
                .catch(err => {
                    logger.error(`Failed to resume music ${this.currentMusicId}: ${err.message || 'Unknown error'}`);
                });
            logger.info(`Music resumed: ${this.currentMusicId}`);
        }
    }

    /**
     * Stop currently playing music
     */
    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
            logger.info(`Music stopped: ${this.currentMusicId}`);
            this.currentMusic = null;
            this.currentMusicId = null;
        }
    }

    /**
     * Set master volume and update all audio elements
     * @param {number} volume - Volume level (0-1)
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this._updateAllVolumes();
        logger.info(`Master volume set to ${volume.toFixed(2)}`);
    }

    /**
     * Set SFX volume and update all SFX elements
     * @param {number} volume - Volume level (0-1)
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this._updateSfxVolumes();
        logger.info(`SFX volume set to ${volume.toFixed(2)}`);
    }

    /**
     * Set music volume and update music elements
     * @param {number} volume - Volume level (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this._updateMusicVolumes();
        logger.info(`Music volume set to ${volume.toFixed(2)}`);
    }

    /**
     * Update volumes for all audio elements
     */
    _updateAllVolumes() {
        this._updateSfxVolumes();
        this._updateMusicVolumes();
    }

    /**
     * Update volumes for all SFX elements
     */
    _updateSfxVolumes() {
        // Update active sound effects
        this.activeSoundEffects.forEach(audio => {
            const id = this._findAudioId(audio);
            if (id && this.audioElements[id].type !== 'music') {
                audio.volume = this.audioElements[id].options.volume * this.sfxVolume * this.masterVolume;
            }
        });
    }

    /**
     * Update volumes for all music elements
     */
    _updateMusicVolumes() {
        // Update currently playing music
        if (this.currentMusic && this.currentMusicId) {
            this.currentMusic.volume =
                this.audioElements[this.currentMusicId].options.volume *
                this.musicVolume *
                this.masterVolume;
        }

        // Update cached music elements
        Object.entries(this.audioElements).forEach(([id, audio]) => {
            if (audio.type === 'music' && audio.element !== this.currentMusic) {
                audio.element.volume = audio.options.volume * this.musicVolume * this.masterVolume;
            }
        });
    }

    /**
     * Find the ID of an audio element in our cache
     * @param {HTMLAudioElement} audioElement - The audio element to find
     * @returns {string|null} - The ID or null if not found
     */
    _findAudioId(audioElement) {
        for (const [id, audio] of Object.entries(this.audioElements)) {
            if (audio.element === audioElement || audio.element.src === audioElement.src) {
                return id;
            }
        }
        return null;
    }

    /**
     * Stop all audio and clean up
     */
    stopAll() {
        // Stop music
        this.stopMusic();

        // Stop all active sound effects
        this.activeSoundEffects.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        this.activeSoundEffects.clear();

        logger.info("All audio stopped");
    }

    /**
     * Check if a sound with the given ID exists
     * @param {string} id - The sound ID to check
     * @returns {boolean} - True if the sound exists
     */
    hasSound(id) {
        return !!this.audioElements[id];
    }

    /**
     * Get all loaded sound IDs
     * @returns {Array} - Array of sound IDs
     */
    getAllSoundIds() {
        return Object.keys(this.audioElements);
    }
}

const audioManager = new AudioManager();
export default audioManager;