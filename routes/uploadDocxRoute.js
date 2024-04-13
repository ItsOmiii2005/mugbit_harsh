
const express = require('express');
const fs = require('fs').promises;

const router = express.Router();

const documentController = require('../controllers/docxController');
const upload = require('../middlewares/upload');


router.post('/upload-document', upload.single('document'), documentController.uploadDocument);
router.post('/submit-form', documentController.submitForm);

router.post('/upload', upload.single('file'), documentController.uploadFile);
// router.post("/generate/:documentId", documentController.generateDocument);
router.post("/generate/:id", documentController.generateDocument);

router.get('/files', documentController.getFiles);

// to delete the routes
router.delete('/delete/:documentId', documentController.deleteDocument);


//^ Following are the some essential routes to track the user activites on teh document cared such as star the document, uses count, views
router.post("/star/:documentId", documentController.updateStarCount);
router.post("/use/:documentId", documentController.updateUseCount);
router.post("/downloadedby/:documentId", documentController.doucmentDownloadedBy);
router.get('/getdownloadedbyuser/:documentId', documentController.getDownloadedByUsers);

// Route to fetch documents uploaded by a specific user
router.get('/user-documents/:username', documentController.getUserUploadedDocuments);

router.post('/upload', upload.single('thumbnails'), documentController.thumbnailImg);
module.exports = router;

