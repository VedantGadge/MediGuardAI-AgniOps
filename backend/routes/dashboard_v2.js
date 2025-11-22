const express = require('express');
const router = express.Router();
console.log('Dashboard routes loaded');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NEON_URI,
  ssl: {
    rejectUnauthorized: false
  }
});

// @route   GET /api/dashboard/ping
// @desc    Test route
// @access  Public
router.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// @route   GET /api/dashboard/disease-distribution
// @desc    Get disease distribution stats
// @access  Public (or Private if auth is added later)
router.get('/disease-distribution', async (req, res) => {
  console.log('Received request for disease distribution');
  try {
    console.log('Executing query...');
    const result = await pool.query(`
      SELECT "Disease", COUNT(*) AS count
      FROM blood_samples
      GROUP BY "Disease"
      ORDER BY count DESC;
    `);
    console.log('Query executed successfully, rows:', result.rows.length);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching disease distribution:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/dashboard/available-biomarkers
// @desc    Get list of available biomarker columns
// @access  Public
router.get('/available-biomarkers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'blood_samples'
      AND data_type IN ('integer', 'numeric', 'double precision', 'real')
      AND column_name != 'Disease';
    `);
    
    const biomarkers = result.rows.map(row => row.column_name);
    res.json(biomarkers);
  } catch (err) {
    console.error('Error fetching biomarkers:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/dashboard/biomarker-data
// @desc    Get biomarker statistics for a specific disease
// @access  Public
router.get('/biomarker-data', async (req, res) => {
  const { disease, biomarker } = req.query;
  
  if (!disease || !biomarker) {
    return res.status(400).json({ message: 'Disease and biomarker parameters are required' });
  }

  try {
    const result = await pool.query(`
      SELECT 
        MIN("${biomarker}") as min,
        MAX("${biomarker}") as max,
        AVG("${biomarker}") as mean,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY "${biomarker}") as q1,
        PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY "${biomarker}") as median,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY "${biomarker}") as q3,
        COUNT(*) as count
      FROM blood_samples
      WHERE "Disease" = $1 AND "${biomarker}" IS NOT NULL;
    `, [disease]);

    if (result.rows[0].count === '0') {
      return res.status(404).json({ message: 'No data found for this combination' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching biomarker data:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// @route   GET /api/dashboard/disease-profile
// @desc    Get top 10 biomarker averages for a specific disease
// @access  Public
router.get('/disease-profile', async (req, res) => {
  console.log('Hit /disease-profile route');
  const { disease } = req.query;
  
  if (!disease) {
    return res.status(400).json({ message: 'Disease parameter is required' });
  }

  try {
    // Get all numeric columns
    const columnsResult = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'blood_samples'
      AND data_type IN ('integer', 'numeric', 'double precision', 'real')
      AND column_name != 'Disease';
    `);
    
    const biomarkers = columnsResult.rows.map(row => row.column_name);
    
    // Calculate average for each biomarker
    const biomarkerAverages = [];
    for (const biomarker of biomarkers) {
      const result = await pool.query(`
        SELECT AVG("${biomarker}") as avg_value
        FROM blood_samples
        WHERE "Disease" = $1 AND "${biomarker}" IS NOT NULL;
      `, [disease]);
      
      if (result.rows[0].avg_value) {
        biomarkerAverages.push({
          biomarker: biomarker,
          value: parseFloat(result.rows[0].avg_value)
        });
      }
    }
    
    // Sort by value and take top 10
    const top10 = biomarkerAverages
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
    
    res.json(top10);
  } catch (err) {
    console.error('Error fetching disease profile:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// @route   GET /api/dashboard/disease-temporal
// @desc    Get disease counts over time for temporal visualization
// @access  Public
router.get('/disease-temporal', async (req, res) => {
  console.log('Hit /disease-temporal route');
  const { disease, interval = 'daily' } = req.query;
  
  try {
    let dateFormat;
    switch(interval) {
      case 'weekly':
        dateFormat = 'YYYY-IW'; // Year and ISO week
        break;
      case 'monthly':
        dateFormat = 'YYYY-MM';
        break;
      case 'yearly':
        dateFormat = 'YYYY';
        break;
      default:
        dateFormat = 'YYYY-MM'; // Default to monthly
    }
    
    let query;
    
    if (disease && disease !== 'all') {
      // Single disease temporal data
      query = `
        SELECT 
          TO_CHAR("Timestamp", '${dateFormat}') as period,
          COUNT(*) as count,
          '${disease}' as disease
        FROM (
          SELECT "Timestamp", "Disease"
          FROM blood_samples
          WHERE "Disease" = $1
          ORDER BY "Timestamp" DESC
          LIMIT 1000
        ) AS limited_data
        GROUP BY period
        ORDER BY period ASC;
      `;
    } else {
      // All diseases temporal data
      query = `
        SELECT 
          TO_CHAR("Timestamp", '${dateFormat}') as period,
          "Disease" as disease,
          COUNT(*) as count
        FROM (
          SELECT "Timestamp", "Disease"
          FROM blood_samples
          WHERE "Disease" != 'Healthy'
          ORDER BY "Timestamp" DESC
          LIMIT 1000
        ) AS limited_data
        GROUP BY period, "Disease"
        ORDER BY period ASC, count DESC;
      `;
    }
    
    const result = disease && disease !== 'all' 
      ? await pool.query(query, [disease])
      : await pool.query(query);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching temporal disease data:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Patient Lookup - Get patient data by ID
router.get('/patient/:patientId', async (req, res) => {
  console.log('Hit /patient/:patientId route');
  try {
    const { patientId } = req.params;
    
    const query = `
      SELECT *
      FROM blood_samples
      WHERE "PatientID" = $1
      ORDER BY "Timestamp" DESC
      LIMIT 1;
    `;
    
    const result = await pool.query(query, [patientId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching patient data:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// @route   GET /api/dashboard/patient-dates/:patientId
// @desc    Get all analysis dates for a patient
// @access  Public
router.get('/patient-dates/:patientId', async (req, res) => {
  console.log('Hit /patient-dates/:patientId route');
  try {
    const { patientId } = req.params;
    
    const query = `
      SELECT "Timestamp"
      FROM blood_samples
      WHERE "PatientID" = $1
      ORDER BY "Timestamp" DESC;
    `;
    
    const result = await pool.query(query, [patientId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No analysis records found for this patient' });
    }
    
    res.json(result.rows.map(row => row.Timestamp));
  } catch (err) {
    console.error('Error fetching patient dates:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// @route   GET /api/dashboard/patient-analysis/:patientId
// @desc    Get patient analysis with disease prediction and top contributing factors
// @access  Public
router.get('/patient-analysis/:patientId', async (req, res) => {
  console.log('Hit /patient-analysis/:patientId route');
  try {
    const { patientId } = req.params;
    const { timestamp } = req.query;
    
    // Get patient data
    let patientQuery;
    let queryParams;
    
    if (timestamp) {
      // Get specific timestamp
      patientQuery = `
        SELECT *
        FROM blood_samples
        WHERE "PatientID" = $1 AND "Timestamp" = $2
        LIMIT 1;
      `;
      queryParams = [patientId, timestamp];
    } else {
      // Get latest
      patientQuery = `
        SELECT *
        FROM blood_samples
        WHERE "PatientID" = $1
        ORDER BY "Timestamp" DESC
        LIMIT 1;
      `;
      queryParams = [patientId];
    }
    
    const patientResult = await pool.query(patientQuery, queryParams);
    
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    const patientData = patientResult.rows[0];
    const disease = patientData.Disease;
    
    // Get all numeric columns (biomarkers)
    const columnsResult = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'blood_samples'
      AND data_type IN ('integer', 'numeric', 'double precision', 'real')
      AND LOWER(column_name) NOT IN ('disease', 'patientid', 'timestamp', 'id');
    `);
    
    const biomarkers = columnsResult.rows.map(row => row.column_name);
    
    // Calculate disease average for each biomarker
    const contributingFactors = [];
    for (const biomarker of biomarkers) {
      const avgResult = await pool.query(`
        SELECT AVG("${biomarker}") as avg_value
        FROM blood_samples
        WHERE "Disease" = $1 AND "${biomarker}" IS NOT NULL;
      `, [disease]);
      
      const patientValue = parseFloat(patientData[biomarker]) || 0;
      const avgValue = parseFloat(avgResult.rows[0].avg_value) || 0;
      
      if (avgValue > 0) {
        // Calculate deviation from average
        const deviation = Math.abs(patientValue - avgValue);
        const percentDeviation = (deviation / avgValue) * 100;
        
        contributingFactors.push({
          biomarker: biomarker,
          patientValue: patientValue,
          diseaseAverage: avgValue,
          deviation: percentDeviation,
          status: patientValue > avgValue ? 'above' : 'below'
        });
      }
    }
    
    // Sort by correlation value (patient value) first, then by deviation
    // Higher correlation is more important than higher deviation
    const topContributingFactors = contributingFactors
      .sort((a, b) => {
        // Primary sort: by patient correlation value (descending)
        const correlationDiff = b.patientValue - a.patientValue;
        if (Math.abs(correlationDiff) > 0.01) { // If correlation difference is significant
          return correlationDiff;
        }
        // Secondary sort: if correlations are similar, sort by deviation
        return b.deviation - a.deviation;
      })
      .slice(0, 10);
    
    res.json({
      patientId: patientId,
      disease: disease,
      timestamp: patientData.Timestamp,
      patientData: patientData,
      topContributingFactors: topContributingFactors
    });
    
  } catch (err) {
    console.error('Error fetching patient analysis:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;

