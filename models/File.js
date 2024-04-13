const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    name: String,
    title: String,
    data: Buffer,
    description: String,
    placeholders: [String],
    uploadedBy: String, 
    downloadedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] , 
    // ! remove this following code if some major error occured!!!
    stars: { type: Number, default: 0 }, // Number of stars for the document
    uses: { type: Number, default: 0 }, // Number of times the document has been used
    views: { type: Number, default: 0 }, // Number of views for the document
    starredBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

fileSchema.methods.remove = function () {
    // Your custom remove logic here
    // For example, to remove the document from the database
    return this.model('File').deleteOne({ _id: this._id });
};

const File = mongoose.model("File", fileSchema);

module.exports = File;
