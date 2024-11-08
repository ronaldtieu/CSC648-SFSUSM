// purpose to this, is to ensure that the inserted information is valid to be inserted into the database
// i.e. if the password meets the criteria


const validateProfileEdit = (req, res, next) => {
    const { firstName, lastName, email, major, minor, pronouns } = req.body;

    // Validation for first name
    if (firstName && (typeof firstName !== 'string' || firstName.trim().length < 1)) {
        return res.json({ 
            success: false, 
            message: 'Invalid first name. It must be at least 1 characters long.' });
    }

    // Validation for last name
    if (lastName && (typeof lastName !== 'string' || lastName.trim().length < 1)) {
        return res.json({ 
            success: false, 
            message: 'Invalid last name. It must be at least 1 characters long.' });
    }

    // Validation for 'major' field
    if (major && typeof major !== 'string') {
        return res.json({ 
            success: false, 
            message: 'Invalid major. It must be a string.' });
    }

    // Validation for 'minor' field
    if (minor && typeof minor !== 'string') {
        return res.json({ 
            success: false, 
            message: 'Invalid minor. It must be a string.' });
    }

    // Validation for 'pronouns' field
    if (pronouns && typeof pronouns !== 'string') {
        return res.json({ 
            success: false, 
            message: 'Invalid pronouns. It must be a string.' });
    }

    // If all validations pass, proceed to the next middleware/controller
    next();
};

// Export the middleware function
module.exports = { validateProfileEdit };