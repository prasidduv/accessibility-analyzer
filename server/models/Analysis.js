const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    score: {
      type: Number,
      required: [true, 'Score is required.'],
      min: 0,
      max: 100
    },
    criticalCount: {
      type: Number,
      default: 0
    },
    warningCount: {
      type: Number,
      default: 0
    },
    issueCount: {
      type: Number,
      default: 0
    },
    passedCount: {
      type: Number,
      default: 0
    },
    htmlSnippet: {
      type: String,
      default: ''
    },
    html: {
      type: String,
      default: ''
    },
    issues: {
      type: Array,
      default: []
    },
    suggestions: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

analysisSchema.methods.toHistoryJSON = function toHistoryJSON() {
  const dateObj = this.timestamp || this.createdAt;

  return {
    id: this._id,
    date: dateObj.toLocaleDateString(),
    time: dateObj.toLocaleTimeString(),
    score: this.score,
    critical: this.criticalCount,
    warning: this.warningCount,
    info: Math.max(0, this.issueCount - this.criticalCount - this.warningCount),
    htmlPreview: this.htmlSnippet,
    html: this.html,
    issues: this.issues,
    suggestions: this.suggestions,
    passedCount: this.passedCount,
    timestamp: dateObj
  };
};

module.exports = mongoose.model('Analysis', analysisSchema);
