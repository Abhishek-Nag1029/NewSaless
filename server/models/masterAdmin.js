const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const masterAdminSchema = ({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    userRole: {
        type: String,
        default: 'MasterAdmin'
    }

})

module.exports = mongoose.model('masterAdmin', masterAdminSchema);