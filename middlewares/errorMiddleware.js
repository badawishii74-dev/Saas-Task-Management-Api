const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log the error for debugging purposes
    console.error(err);

    // Handle specific error types
    if (err.name === 'CastError') {
        error.message = 'Invalid ID format';
        error.statusCode = 400;
    }

    if (err.code === 11000) {
        error.message = 'Duplicate field value entered';
        error.statusCode = 400;
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
};

module.exports = errorHandler;