const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// const db = mysql.createConnection({
//   host: '127.0.0.1',
//   user: 'admin',
//   password: 'AZ4LroLaCGlDDromeBNJ',
//   database: 'ram-inv-prod',
//   port: 3306
// });

const db = mysql.createConnection({
    host: '3.222.49.3',
    user: 'root',
    password: '',
    database: 'ram-inv-prod',
    port: 3306
  });

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

app.get('/api/form-data', (req, res) => {
    const sql = 'SELECT * FROM infusion_visit_data'

//   const sql = `SELECT DISTINCT 
//     s.first_name,
//     s.last_name,
//     s.birth_date AS dob,  
//     UPPER(s.patient_id) AS patient_id,
//     sva.subject_key,
//     sva.visit_name,
//     sva.start,
//     sva.study_key,
//     svpq.answer AS screening_weight,
//     SUBSTRING_INDEX(sva_arm.arm_name, '-', 1) as arm_name, 
//     st.protocol_number, 
//     si.name AS site_name  
// FROM CRIO.subject_visit_appointment sva
// LEFT JOIN CRIO.subject s 
//     ON sva.subject_key = s.subject_key  
// LEFT JOIN CRIO.subject_visit sv_screening 
//     ON sva.subject_key = sv_screening.subject_key 
//     AND sv_screening.name = 'Screening'
// LEFT JOIN CRIO.subject_visit_procedure_question svpq 
//     ON sv_screening.subject_visit_key = svpq.subject_visit_key 
//     AND svpq.variable_name = 'weight'
//     AND svpq.initial_answer_date_completed IS NOT NULL
// LEFT JOIN CRIO.study_visit sv 
//     ON sva.visit_name = sv.name
//     AND sva.study_key = sv.study_key  
// LEFT JOIN (
//     SELECT sva.study_visit_key, 
//            MAX(sa.name) AS arm_name  
//     FROM CRIO.study_visit_arm sva
//     JOIN CRIO.study_arm sa 
//         ON sva.study_arm_key = sa.study_arm_key
//     GROUP BY sva.study_visit_key  
// ) sva_arm 
//     ON sv.study_visit_key = sva_arm.study_visit_key
// LEFT JOIN CRIO.study st 
//     ON sva.study_key = st.study_key  
// LEFT JOIN CRIO.site si 
//     ON st.site_key = si.site_key  
// WHERE 
//     sva.study_key = 120879
//     AND sva.date_started IS NULL
//     AND sva.calendar_appointment_key IS NOT NULL
//     AND sva.start > CURRENT_DATE
//     AND UPPER(s.patient_id) REGEXP '^[A-Z0-9]{5}-[A-Z0-9]{3}-[A-Z0-9]{3}$'
//     AND sva.visit_name IN (
//         SELECT DISTINCT sv.name
//         FROM CRIO.study_visit sv
//         WHERE sv.study_visit_key IN (
//             SELECT DISTINCT svp.study_visit_key
//             FROM CRIO.study_visit_procedure svp
//             WHERE svp.study_procedure_key IN (
//                 SELECT sp.study_procedure_key
//                 FROM CRIO.study_procedure sp
//                 WHERE sp.name = 'FPI-2265 administration 50 kBq/kg Q4Wc'
//                   AND sp.study_key = 120879
//             )
//         )
//     );`;
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

app.get('/api/study-data', (req, res) => {
  const sql = 'SELECT * FROM study';
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      console.log('result :>> ', results);
      res.json(results);
    }
  });
});





// ✅ Save or Update Data Based on Patient Name & DOS
app.post('/api/save-dos-details', (req, res) => {
  const data = req.body;
  // ✅ Convert empty strings to NULL for DATE, TIME, and DECIMAL fields
  function sanitize(value, defaultValue = null) {
    return value === '' || value === undefined || value === null ? defaultValue : value;
  }

  const checkSql = `SELECT id FROM dos_details WHERE patientId = ? AND DOS = ?`;
  data.proposed_administration_date = data.proposed_administration_date.substring(0, 10)
  db.query(checkSql, [data.subjectId, sanitize(data.proposed_administration_date, '1970-01-01')], (err, result) => {
    if (err) {
      console.error('🔴 MySQL Error:', err.sqlMessage);
      return res.status(500).send({ error: err.sqlMessage });
    }
    console.log('object :>> ', data.proposed_administration_date );

    if (result.length > 0) {
      // ✅ If record exists, UPDATE
      const updateSql = `
        UPDATE dos_details SET
          study_name = ?, visit = ?, weightDayOfDose = ?, dateCalibration = ?, timeCalibration = ?, 
          rac = ?, racUci = ?, three_label_pictures = ?, fill_sec3_wd = ?, send_forms = ?, 
          prescribedDosage = ?, prescribedDosageUci = ?, manufacturer = ?, containerId = ?, 
          rx_batch = ?, lotBatch = ?, quality = ?, form = ?, volume = ?, 
          vial_activity = ?, vial_activity_date = ?, vial_activity_time = ?, 
          syringeId = ?, syringeVolume = ?, syringe_activity = ?, syringe_activity_date = ?, syringe_activity_time = ?
        WHERE patientId = ? AND DOS = ?`;

      db.query(updateSql, [
        sanitize(data.study_name), sanitize(data.visit), sanitize(data.weightDayOfDose),
        sanitize(data.dateCalibration), sanitize(data.timeCalibration), sanitize(data.rac), sanitize(data.racUci),
        data.three_label_pictures ? 1 : 0, data.fill_sec3_wd ? 1 : 0, data.send_forms ? 1 : 0,
        sanitize(data.prescribedDosage), sanitize(data.prescribedDosageUci), sanitize(data.manufacturer),
        sanitize(data.containerId), sanitize(data.rx_batch), sanitize(data.lotBatch), data.quality ? 1 : 0,
        sanitize(data.form), sanitize(data.volume), sanitize(data.vial_activity), sanitize(data.vial_activity_date),
        sanitize(data.vial_activity_time), sanitize(data.syringeId), sanitize(data.syringeVolume),
        sanitize(data.syringe_activity), sanitize(data.syringe_activity_date), sanitize(data.syringe_activity_time),
        data.subjectId, sanitize(data.proposed_administration_date.substring(0, 10), '1970-01-01')
      ], (err, result) => {
        if (err) {
          console.error('🔴 MySQL Update Error:', err.sqlMessage);
          return res.status(500).send({ error: err.sqlMessage });
        }
        res.send({ message: 'Data updated successfully' });
      });

    } else {
      // ✅ If no record exists, INSERT new record
      const insertSql = `
        INSERT INTO dos_details (
          patientId, DOS, study_name, visit, weightDayOfDose, dateCalibration, timeCalibration, 
          rac, racUci, three_label_pictures, fill_sec3_wd, send_forms, 
          prescribedDosage, prescribedDosageUci, manufacturer, containerId, 
          rx_batch, lotBatch, quality, form, volume, 
          vial_activity, vial_activity_date, vial_activity_time, 
          syringeId, syringeVolume, syringe_activity, syringe_activity_date, syringe_activity_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(insertSql, [
        data.subjectId, sanitize(data.proposed_administration_date.substring(0, 10), '1970-01-01'), sanitize(data.study_name),
        sanitize(data.visit), sanitize(data.weightDayOfDose), sanitize(data.dateCalibration),
        sanitize(data.timeCalibration), sanitize(data.rac), sanitize(data.racUci),
        data.three_label_pictures ? 1 : 0, data.fill_sec3_wd ? 1 : 0, data.send_forms ? 1 : 0,
        sanitize(data.prescribedDosage), sanitize(data.prescribedDosageUci), sanitize(data.manufacturer),
        sanitize(data.containerId), sanitize(data.rx_batch), sanitize(data.lotBatch), data.quality ? 1 : 0,
        sanitize(data.form), sanitize(data.volume), sanitize(data.vial_activity), sanitize(data.vial_activity_date),
        sanitize(data.vial_activity_time), sanitize(data.syringeId), sanitize(data.syringeVolume),
        sanitize(data.syringe_activity), sanitize(data.syringe_activity_date), sanitize(data.syringe_activity_time)
      ], (err, result) => {
        if (err) {
          console.error('🔴 MySQL Insert Error:', err.sqlMessage);
          return res.status(500).send({ error: err.sqlMessage });
        }
        res.send({ message: 'Data inserted successfully' });
      });
    }
  });
});

// ✅ Load Data for a Patient and Date of Service
app.get('/api/load-dos-details/:patientId/:DOS', (req, res) => {
  const { patientId, DOS } = req.params;
  const sql = `SELECT * FROM dos_details WHERE patientId = ? AND DOS = ?`;

  db.query(sql, [patientId, DOS], (err, result) => {
    if (err) {
      console.error('🔴 MySQL Error:', err.sqlMessage);
      return res.status(500).send({ error: err.sqlMessage });
    }
    res.send(result.length > 0 ? result[0] : {});
  });
});



const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});