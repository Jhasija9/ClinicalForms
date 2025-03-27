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



// const PORT = 3001;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });





function queryAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// Generate S3 pre-signed URL
async function generatePresignedUrl(s3Url) {
  try {
    const path = s3Url.replace("s3://unithera-dev-raminventory/", "");
    const s3Client = new S3Client({
      region: "us-east-1",
      credentials: {
        accessKeyId: "AKIASODIIJ7ROCGS3FPB",
        secretAccessKey: "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",
      },
    });

    const command = new GetObjectCommand({
      Bucket: "unithera-dev-raminventory",
      Key: path,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw error;
  }
}

// GET vial by rxNumber with presigned URLs
app.get("/api/vial-data/:rxNumber", async (req, res) => {
  try {
    const { rxNumber } = req.params;
    const results = await queryAsync("SELECT * FROM vial WHERE rx_number = ?", [rxNumber]);

    if (!results || results.length === 0) {
      return res.status(404).json({ error: "Vial data not found" });
    }

    const data = results[0];

    if (data.label_image_url) {
      data.label_image_url = await generatePresignedUrl(data.label_image_url);
    }
    if (data.coa_image_url) {
      data.coa_image_url = await generatePresignedUrl(data.coa_image_url);
    }
    if (data.vial_image_url) {
      data.vial_image_url = await generatePresignedUrl(data.vial_image_url);
    }

    res.json(data);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Error fetching vial data", details: err.message });
  }
});

// GET all vials
app.get("/api/vial-data", async (req, res) => {
  try {
    const results = await queryAsync("SELECT * FROM vial");
    res.json(results);
  } catch (err) {
    console.error("Error fetching vials:", err);
    res.status(500).json({ error: "Error fetching vial data" });
  }
});

// GET form data
// app.get("/api/form-data", async (req, res) => {
//   try {
//     const results = await queryAsync("SELECT * FROM infusion_visit_data");
//     res.json(results);
//   } catch (err) {
//     console.error("Error fetching form data:", err);
//     res.status(500).json({ error: "Error fetching form data" });
//   }
// });
app.get("/api/form-data", async (req, res) => {
  try {
    const sql = `
      SELECT i.*, d.status_id, s.status_name 
      FROM infusion_visit_data i 
      LEFT JOIN dos_details d ON i.patient_id = d.patientId 
      LEFT JOIN Status s ON d.status_id = s.id`;

    const results = await queryAsync(sql);
    res.json(results);
  } catch (err) {
    console.error("Error fetching form data:", err);
    res.status(500).json({ error: "Error fetching form data" });
  }
});
// Get only completed orders
app.get("/api/nuclear-med-orders", async (req, res) => {
  try {
    const sql = `
      SELECT i.*, d.status_id, s.status_name 
      FROM infusion_visit_data i 
      LEFT JOIN dos_details d ON i.patient_id = d.patientId 
      LEFT JOIN Status s ON d.status_id = s.id
      WHERE s.status_name IN ('completed', 'order_sent')`;  // Only get completed orders

    const results = await queryAsync(sql);
    res.json(results);
  } catch (err) {
    console.error("Error fetching nuclear med data:", err);
    res.status(500).json({ error: "Error fetching data" });
  }
});
app.post("/api/update-orders-sent", async (req, res) => {
  try {
    const { patientIds } = req.body;
    
    const sql = `
      UPDATE Status 
      SET status_name = 'order_sent' 
      WHERE id IN (
        SELECT status_id 
        FROM dos_details 
        WHERE patientId IN (?)
      )`;
    
    await queryAsync(sql, [patientIds]);
    res.json({ message: 'Orders updated successfully' });
  } catch (err) {
    console.error("Error updating orders:", err);
    res.status(500).json({ error: "Error updating orders" });
  }
});

// GET study data
app.get("/api/study-data", async (req, res) => {
  try {
    const results = await queryAsync("SELECT * FROM study");
    res.json(results);
  } catch (err) {
    console.error("Error fetching study data:", err);
    res.status(500).json({ error: "Error fetching study data" });
  }
});

// PUT update attestation
app.put("/api/update-attestation/:rxNumber", async (req, res) => {
  try {
    const { rxNumber } = req.params;
    const updateData = req.body;

    if (!updateData) {
      return res.status(400).json({ error: "No update data provided", receivedData: req.body });
    }

    const formattedDate = updateData.calibration_date
      ? new Date(updateData.calibration_date).toISOString().slice(0, 19).replace("T", " ")
      : null;

    const query = `
      UPDATE vial
      SET 
        Radiopharmaceutical = ?,
        patient_id = ?,
        actual_amount = ?,
        lot_number = ?,
        Manufacturer = ?,
        volume = ?,
        product = ?,
        radio_nuclide = ?,
        form_label = ?,
        calibration_date = ?,
        radioactivity_concentration = ?,
        status = ?
      WHERE rx_number = ?
    `;

    const values = [
      updateData.Radiopharmaceutical || null,
      updateData.patient_id || null,
      updateData.actual_amount || null,
      updateData.lot_number || null,
      updateData.Manufacturer || null,
      updateData.volume || null,
      updateData.product || null,
      updateData.radio_nuclide || null,
      updateData.form_label || null,
      formattedDate,
      updateData.radioactivity_concentration || null,
      updateData.status || null,
      rxNumber,
    ];

    const result = await queryAsync(query, values);

    res.json({
      success: true,
      message: "Attestation updated successfully",
      result,
    });
  } catch (error) {
    console.error("Error updating attestation:", error);
    res.status(500).json({
      error: "Failed to update attestation",
      details: error.message,
      receivedData: req.body,
    });
  }
});
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
          syringeId = ?, syringeVolume = ?, syringe_activity = ?, syringe_activity_date = ?, syringe_activity_time = ?,status_id = ?
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
        sanitize(data.status_id),
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
          syringeId, syringeVolume, syringe_activity, syringe_activity_date, syringe_activity_time,status_id
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
        sanitize(data.syringe_activity), sanitize(data.syringe_activity_date), sanitize(data.syringe_activity_time),
        sanitize(data.status_id)
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
app.post('/api/create-status', (req, res) => {
  const insertSql = "INSERT INTO Status (status_name) VALUES ('completed')";
  
  db.query(insertSql, (err, result) => {
    if (err) {
      console.error('Error creating status:', err);
      return res.status(500).json({ error: err.message });
    }
    
    // In MySQL, the insertId property gives us the ID of the newly inserted row
    const newStatusId = result.insertId;
    console.log('Created status with ID:', newStatusId);
    
    res.json({ id: newStatusId });
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
