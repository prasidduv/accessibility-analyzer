const express = require('express');
const Analysis = require('../models/Analysis');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

async function refreshUserStats(userId) {
  const analyses = await Analysis.find({ userId }).select('score');

  const totalAnalyses = analyses.length;

  if (totalAnalyses === 0) {
    await User.findByIdAndUpdate(userId, {
      totalAnalyses: 0,
      bestScore: 0,
      averageScore: 0
    });
    return;
  }

  const scores = analyses.map((analysis) => analysis.score);
  const bestScore = Math.max(...scores);
  const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / totalAnalyses);

  await User.findByIdAndUpdate(userId, {
    totalAnalyses,
    bestScore,
    averageScore
  });
}

router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      score,
      criticalCount,
      warningCount,
      issueCount,
      passedCount,
      htmlSnippet,
      html,
      issues
    } = req.body;

    if (score === undefined || score === null || Number.isNaN(Number(score))) {
      return res.status(400).json({
        success: false,
        message: 'A valid accessibility score is required to save this analysis.'
      });
    }

    const analysis = await Analysis.create({
      userId: req.user._id,
      score: Number(score),
      criticalCount: Number(criticalCount) || 0,
      warningCount: Number(warningCount) || 0,
      issueCount: Number(issueCount) || 0,
      passedCount: Number(passedCount) || 0,
      htmlSnippet: htmlSnippet || '',
      html: html || '',
      issues: Array.isArray(issues) ? issues : [],
      timestamp: new Date()
    });

    await refreshUserStats(req.user._id);

    return res.status(201).json({
      success: true,
      message: 'Analysis saved successfully.',
      analysis: analysis.toHistoryJSON()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'We could not save your analysis right now. Please try again.'
    });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(10);

    return res.json({
      success: true,
      analyses: analyses.map((analysis) => analysis.toHistoryJSON())
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'We could not load your analysis history. Please try again.'
    });
  }
});

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('totalAnalyses bestScore averageScore');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'We could not find your account stats.'
      });
    }

    const aggregates = await Analysis.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          totalIssues: { $sum: '$issueCount' },
          totalCritical: { $sum: '$criticalCount' },
          totalWarnings: { $sum: '$warningCount' },
          averagePassed: { $avg: '$passedCount' }
        }
      }
    ]);

    const stats = aggregates[0] || {
      totalIssues: 0,
      totalCritical: 0,
      totalWarnings: 0,
      averagePassed: 0
    };

    return res.json({
      success: true,
      stats: {
        totalAnalyses: user.totalAnalyses,
        bestScore: user.bestScore,
        averageScore: user.averageScore,
        totalIssues: stats.totalIssues,
        totalCritical: stats.totalCritical,
        totalWarnings: stats.totalWarnings,
        averagePassed: Math.round(stats.averagePassed || 0)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'We could not load your stats right now. Please try again.'
    });
  }
});

router.patch('/latest/suggestions', authMiddleware, async (req, res) => {
  try {
    const { suggestions } = req.body;

    if (typeof suggestions !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Suggestions text is required.'
      });
    }

    const latestAnalysis = await Analysis.findOne({ userId: req.user._id }).sort({ timestamp: -1 });

    if (!latestAnalysis) {
      return res.status(404).json({
        success: false,
        message: 'No recent analysis was found to update.'
      });
    }

    latestAnalysis.suggestions = suggestions;
    await latestAnalysis.save();

    return res.json({
      success: true,
      message: 'Suggestions saved successfully.',
      analysis: latestAnalysis.toHistoryJSON()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'We could not save your suggestions right now. Please try again.'
    });
  }
});

router.delete('/', authMiddleware, async (req, res) => {
  try {
    await Analysis.deleteMany({ userId: req.user._id });
    await refreshUserStats(req.user._id);

    return res.json({
      success: true,
      message: 'Your analysis history has been cleared.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'We could not clear your history right now. Please try again.'
    });
  }
});

module.exports = router;
