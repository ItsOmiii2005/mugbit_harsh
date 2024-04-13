
// Require modules
const fs = require("fs");
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const officeParser = require('officeparser');
const File = require("../models/File");

// Check for Is? there a document directory exists or not!
const tempDir = './documents';
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

const uploadDocument = async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const fileBuffer = req.file.buffer;

    const tempFilePath = './documents/tempFile.docx';
    try {
        await fs.promises.writeFile(tempFilePath, fileBuffer);

        const data = await officeParser.parseOfficeAsync(fileBuffer);

        const extractAndConsolidatePlaceholders = (text) => {
            const regex = /\{([^}]+)\}/g;
            const matches = text.match(regex);

            if (!matches) {
                return [];
            }

            const uniquePlaceholders = new Set();

            matches.forEach((match) => {
                const placeholder = match.slice(1, -1);
                uniquePlaceholders.add(placeholder);
            });

            return Array.from(uniquePlaceholders);
        };

        const placeholders = extractAndConsolidatePlaceholders(data);

        console.log('Consolidated Placeholders:', placeholders, "and the file is", fileBuffer, "\n");

        res.status(200).json({ placeholders });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error parsing the document.');
    }
};

const submitForm = async (req, res) => {
    const tempFilePath = './documents/tempFile.docx';

    try {
        const fileContent = await fs.promises.readFile(tempFilePath, { encoding: 'utf-8' });
        const templateFile = fs.readFileSync(tempFilePath, 'binary');
        const zip = new PizZip(templateFile);
        let outputDocument = new Docxtemplater(zip);

        const formData = req.body;
        console.log(formData);
        outputDocument.setData(formData);

        try {
            outputDocument.render();
            let outputDocumentBuffer = outputDocument.getZip().generate({ type: 'nodebuffer' });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename="MugBit_Generated_Document.docx"`);

            res.send(outputDocumentBuffer);
        } catch (error) {
            console.error('Error filling out template:', error);
            res.status(500).send('Internal Server Error');
        }
    } catch (error) {
        console.error('Error reading file:', error);
        res.status(500).send('Error reading the file.');
    }
}

// const uploadFile = async (req, res) => {
//     const fileBuffer = req.file.buffer;
//     try {
//         const tempFilePath = './documents/tempFile.docx';
//         await fs.promises.writeFile(tempFilePath, fileBuffer);

//         const data = await officeParser.parseOfficeAsync(fileBuffer);

//         const extractAndConsolidatePlaceholders = (text) => {
//             const regex = /\{([^}]+)\}/g;
//             const matches = text.match(regex);

//             if (!matches) {
//                 return [];
//             }

//             const uniquePlaceholders = new Set();

//             matches.forEach((match) => {
//                 const placeholder = match.slice(1, -1);
//                 uniquePlaceholders.add(placeholder);
//             });

//             return Array.from(uniquePlaceholders);
//         };

//         const outputplaceholders = extractAndConsolidatePlaceholders(data);

//         const newFile = new File({
//             name: req.file.originalname,
//             data: req.file.buffer,
//             placeholders: outputplaceholders
//         });
//         await newFile.save();
//         res.json({ message: 'File uploaded successfully' });
//     } catch (error) {
//         console.error('Error uploading file:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// }

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }


        const fileBuffer = req.file.buffer;
        const tempFilePath = './documents/tempFile.docx';
        

        await fs.promises.writeFile(tempFilePath, fileBuffer);


        // Assuming officeParser is an asynchronous function
        const data = await officeParser.parseOfficeAsync(fileBuffer);

        const extractAndConsolidatePlaceholders = (text) => {
            const regex = /\{([^}]+)\}/g;
            const matches = text.match(regex);

            if (!matches) {
                return [];
            }

            const uniquePlaceholders = new Set();

            matches.forEach((match) => {
                const placeholder = match.slice(1, -1);
                uniquePlaceholders.add(placeholder);
            });

            return Array.from(uniquePlaceholders);
        };

        const outputPlaceholders = extractAndConsolidatePlaceholders(data);

        const newFile = new File({
            name: req.file.originalname,
            title: req.body.title,
            data: req.file.buffer,
            description: req.body.description,
            placeholders: outputPlaceholders,
            uploadedBy: req.body.username
        });

        await newFile.save();

        res.json({ message: 'File uploaded successfully' });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getFiles = async (req, res) => {
    try {
        const files = await File.find({});
        res.json(files);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// const generateDocument = async (req, res) => {
//     const tempFilePath = './documents/tempFile.docx';
//     const formData = req.body;
//     try {
//         const fileContent = await fs.promises.readFile(tempFilePath, { encoding: 'utf-8' });
//         const templateFile = fs.readFileSync(tempFilePath, 'binary');
//         const zip = new PizZip(templateFile);
//         let outputDocument = new Docxtemplater(zip);

//         console.log(req.body);
//         outputDocument.setData(formData);
//         // outputDocument.setData(formData);

//         try {
//             outputDocument.render();
//             let outputDocumentBuffer = outputDocument.getZip().generate({ type: 'nodebuffer' });

//             res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
//             res.setHeader('Content-Disposition', `attachment; filename="Downloaded.docx"`);

//             res.send(outputDocumentBuffer);
//         } catch (error) {
//             console.error('Error filling out template:', error);
//             res.status(500).send('Internal Server Error');
//         }
//     } catch (error) {
//         console.error('Error reading file:', error);
//         res.status(500).send('Error reading the file.');
//     }
// }

const generateDocument = async (req, res) => {
    const documentId = req.params.id; // Assuming the ID is passed in the request parameters
    try {
        // Fetch the document from the database using the ID
        const document = await File.findById(documentId);

        if (!document) {
            return res.status(404).send('Document not found');
        }

        // Extract data and placeholders from the document
        const fileBuffer = document.data;
        const placeholders = document.placeholders;

        // Continue with the rest of your code for rendering and sending the document
        const tempFilePath = './documents/tempFile.docx';
        const zip = new PizZip(fileBuffer);
        let outputDocument = new Docxtemplater(zip);

        // Use the fetched placeholders for rendering
        outputDocument.setData(req.body);

        try {
            outputDocument.render();
            let outputDocumentBuffer = outputDocument.getZip().generate({ type: 'nodebuffer' });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename="MugBit_Generated_Document.docx"`);

            res.send(outputDocumentBuffer);
        } catch (error) {
            console.error('Error filling out template:', error);
            res.status(500).send('Internal Server Error');
        }
    } catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).send('Error fetching the document.');
    }
}



const deleteDocument = async (req, res) => {
    const documentId = req.params.documentId;

    try {
        // Find the document by ID
        const document = await File.findById(documentId);

        // Check if the document exists
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Perform the deletion
        await document.remove();

        // Respond with a success message
        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const handleUpload = async (req, res) => {
    const { file, username } = req.body;
    const existingDocument = await Document.findOne({ user: username, name: file.originalname });

    if (existingDocument) {
        return res.status(400).json({ error: 'Document with the same name already exists.' });
    }

    try {
        const newDocument = new Document({
            user: username,
            name: file.originalname,
            // other document details...
        });

        // Save the document details to the database
        await newDocument.save();

        // Perform the actual file upload logic here...

        res.status(200).json({ message: 'Document uploaded successfully.' });
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// this controller is used to give star to a document...
// const updateStarCount = async (req, res) => {
//     const documentId = req.params.documentId;
//     const userId = req.params.userId; // Assuming you have user authentication and can access user ID

//     try {
//         const document = await File.findById(documentId);
//         if (!document) {
//             return res.status(404).json({ message: "Document not found" });
//         }

//         // Check if the user has already starred the document
//         const alreadyStarred = document.starredBy.includes(userId);

//         if (alreadyStarred) {
//             // If already starred, remove the star
//             document.stars -= 1;
//             document.starredBy = document.starredBy.filter(user => user != userId);
//         } else {
//             // If not already starred, add the star
//             document.stars += 1;
//             document.starredBy.push(userId);
//         }

//         await document.save();
//         res.status(200).json({ stars: document.stars }); // Sending back the updated number of stars
//     } catch (error) {
//         console.error('Error starring document:', error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

const updateStarCount = async (req, res) => {
    const documentId = req.params.documentId;
    const userId = req.body.userID; // Assuming you have user authentication and can access user ID
    console.log("the user id is this", userId);

    try {
        const document = await File.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Check if the user has already starred the document
        const alreadyStarred = document.starredBy.includes(userId);

        if (alreadyStarred) {
            // If already starred, remove the star
            // document.stars -= 1;
            document.stars = Math.max(0, document.stars - 1);
            document.starredBy = document.starredBy.filter(user => user != userId);
        } else {
            // If not already starred, add the star
            document.stars += 1;
            document.starredBy.push(userId);
        }

        document.views += 1;

        await document.save();
        res.status(200).json({ stars: document.stars }); // Sending back the updated number of stars
    } catch (error) {
        console.error('Error starring document:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateUseCount = async (req, res) => {
    const documentId = req.params.documentId;
    const userId = req.body.userID; // Assuming you have user authentication and can access user ID

    try {
        const document = await File.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Check if the user has already used the document
        const alreadyUsed = document.downloadedBy.includes(userId);

        if (!alreadyUsed) {
            // If not already used, increment the use count and add the user ID
            document.uses += 1;
            document.downloadedBy.push(userId);
        }

        document.views += 1;

        await document.save();
        res.status(200).json({ uses: document.uses }); // Sending back the updated number of uses
    } catch (error) {
        console.error('Error using document:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const doucmentDownloadedBy = async (req, res) => {
    const documentId = req.params.documentId;
    const userId = req.body.userID; // Assuming you have user authentication and can access user ID
    // const username = req.body.userName; // Assuming you have user authentication and can access user ID
    // console.log("document by user in backd ", username)

    try {
        const document = await File.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Update the downloadedBy array with the user ID
        document.downloadedBy.push(userId);

        // Save the document with the updated downloadedBy array
        await document.save();

        res.status(200).json({ message: "Document downloaded successfully" });
    } catch (error) {
        console.error('Error downloading document:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};



const getDownloadedByUsers = async (req, res) => {
    const documentId = req.params.documentId; // Assuming the document ID is passed as a parameter

    try {
        // Find the document by its ID and populate the downloadedBy field with user documents
        const document = await File.findById(documentId).populate('downloadedBy', 'username');
        // console.log(document);

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Extract the names of users who downloaded the document
        const downloadedByUsers = document.downloadedBy.map(user => user.username);

        // Send the list of downloadedByUsers in the response
        res.status(200).json({ downloadedByUsers });
    } catch (error) {
        console.error('Error fetching downloadedBy users:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getUserUploadedDocuments = async (req, res) => {
    const username = req.params.username;

    try {
        // Query the database to find all documents uploaded by the specified user
        const documents = await File.find({ uploadedBy: username });

        res.status(200).json({ documents });
    } catch (error) {
        console.error('Error fetching user documents:', error);
        res.status(500).json({ message: "Internal server error" });
    }
}


const thumbnailImg = (req, res) => {
    const imageData = req.body.imageData; // Assuming imageData is sent in the request body
    const binaryData = Buffer.from(imageData, 'base64');
    const binary = new Binary(binaryData);

    // Save binary to MongoDB
    // Example: MyModel.create({ data: binary });

    res.send('Image uploaded successfully');
}

module.exports = {
    uploadDocument,
    submitForm,
    uploadFile,
    getFiles,
    generateDocument,
    deleteDocument,
    handleUpload,

    updateStarCount,
    updateUseCount,
    doucmentDownloadedBy,
    getDownloadedByUsers,
    getUserUploadedDocuments,
    thumbnailImg
}
