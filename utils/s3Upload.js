// utils/s3Upload.js
const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config();

// Configure AWS S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Reusable function to create a Multer instance for S3 uploads
const createS3Upload = (fieldName, bucket = process.env.AWS_S3_BUCKET) => {
  return multer({
    storage: multerS3({
      s3: s3,
      bucket: bucket,
      key: (req, file, cb) => {
        const fileName = `${Date.now().toString()}-${file.originalname}`;
        cb(null, fileName);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.fieldname === fieldName && !file.mimetype.startsWith('image/')) {
        return cb(new Error(`Only image files are allowed for the ${fieldName} field`));
      }
      cb(null, true);
    },
  });
};

// Middleware for single file upload
const uploadSingle = (fieldName, bucket) => createS3Upload(fieldName, bucket).single(fieldName);

// Utility to get S3 URL for uploaded file
const getS3Url = (bucket, region, key) => {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

module.exports = {
  uploadSingle,
  getS3Url,
};