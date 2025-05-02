// utils/s3Upload.js
const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
require("dotenv").config();

// Configure AWS S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Single file upload (e.g., only "image" or "resume")
const uploadSingle = (fieldName, bucket = process.env.AWS_S3_BUCKET) => {
  return multer({
    storage: multerS3({ 
      s3,
      bucket,
      
      key: (req, file, cb) => {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (fieldName === "image" && !file.mimetype.startsWith("image/")) {
        return cb(new Error("Only image files are allowed"));
      }
      if (fieldName === "resume" && file.mimetype !== "application/pdf") {
        return cb(new Error("Only PDF files are allowed for resume"));
      }
      cb(null, true);
    },
  }).single(fieldName);
};

// Multiple fields upload
const uploadMultiple = (fields, bucket = process.env.AWS_S3_BUCKET) => {
  return multer({
    storage: multerS3({
      s3,
      bucket,
      
      key: (req, file, cb) => {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.fieldname === "image" && !file.mimetype.startsWith("image/")) {
        return cb(new Error("Only image files are allowed"));
      }
      if (file.fieldname === "resume" && file.mimetype !== "application/pdf") {
        return cb(new Error("Only PDF files are allowed for resume"));
      }
      cb(null, true);
    },
  }).fields(fields);
};

// Helper for getting S3 URLs
const getS3Url = (bucket, region, key) => {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  getS3Url,
};
