import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    stats: {
        playTime: {
            type: Number,
            default: 0
        },
        kills: {
            type: Number,
            default: 0
        },
        deaths: {
            type: Number,
            default: 0
        },
        missionsCompleted: {
            type: Number,
            default: 0
        },
        logsCollected: {
            type: Number,
            default: 0
        }
    },
    progress: {
        currentMission: {
            type: String,
            default: 'tutorial'
        },
        unlockedAreas: [{
            type: String
        }],
        collectedItems: [{
            type: String
        }]
    },
    preferences: {
        difficulty: {
            type: String,
            enum: ['easy', 'normal', 'hard'],
            default: 'normal'
        },
        audio: {
            music: {
                type: Number,
                min: 0,
                max: 100,
                default: 50
            },
            sfx: {
                type: Number,
                min: 0,
                max: 100,
                default: 50
            }
        },
        controls: {
            sensitivity: {
                type: Number,
                min: 1,
                max: 10,
                default: 5
            }
        }
    },
    activeSession: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        default: null
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Method to update stats
userSchema.methods.updateStats = async function(updates) {
    Object.keys(updates).forEach(key => {
        if (this.stats[key] !== undefined) {
            this.stats[key] = updates[key];
        }
    });
    return this.save();
};

// Method to update progress
userSchema.methods.updateProgress = async function(updates) {
    Object.keys(updates).forEach(key => {
        if (this.progress[key] !== undefined) {
            if (Array.isArray(this.progress[key])) {
                this.progress[key] = [...new Set([...this.progress[key], ...updates[key]])];
            } else {
                this.progress[key] = updates[key];
            }
        }
    });
    return this.save();
};

// Method to update preferences
userSchema.methods.updatePreferences = async function(updates) {
    Object.keys(updates).forEach(key => {
        if (this.preferences[key] !== undefined) {
            if (typeof this.preferences[key] === 'object') {
                Object.keys(updates[key]).forEach(subKey => {
                    if (this.preferences[key][subKey] !== undefined) {
                        this.preferences[key][subKey] = updates[key][subKey];
                    }
                });
            } else {
                this.preferences[key] = updates[key];
            }
        }
    });
    return this.save();
};

const User = mongoose.model('User', userSchema);

export default User;
